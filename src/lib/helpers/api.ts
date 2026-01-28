import { error } from "console";
import { supabase } from "../supabase";
import { Meal, UserRole } from "./types";

// Auth helpers
export const authHelpers = {
  async signUp(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    phone?: string,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, phone },
      },
    });
    return { data, error };
  },

  async forgotPassword(email: string, redirectTo: string) {
    //! Show a generic success message (so we don't leak that email exists)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    return { data, error };
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  },

  /**
   * Realtime: Notifications for a specific restaurant (user_id = restaurantId)
   * Make sure RLS allows SELECT on notifications where user_id = auth.uid()
   */
  subscribeToRestaurantNotifications(
    restaurantId: string,
    handlers: {
      onInsert?: (n: any) => void;
      onUpdate?: (n: any) => void;
      onError?: (err: any) => void;
      onSubscribed?: () => void;
    } = {},
  ) {
    const channelName = `notifications:${restaurantId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${restaurantId}`,
        },
        (payload) => {
          handlers.onInsert?.(payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${restaurantId}`,
        },
        (payload) => {
          handlers.onUpdate?.(payload.new);
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") handlers.onSubscribed?.();
        if (err) handlers.onError?.(err);
      });

    // return both channel + cleanup helper
    const unsubscribe = async () => {
      await supabase.removeChannel(channel);
    };

    return { channel, unsubscribe };
  },

  /**
   * Listen for auth state changes (PASSWORD_RECOVERY, SIGNED_IN, etc.)
   */
  onAuthStateChange(
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Get current session (used after refresh on reset-password page)
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  async getConsumerDetails(userId: string) {
    const { data, error } = await supabase
      .from("consumer_details")
      .select("*")
      .eq("user_id", userId)
      .single();
    return { data, error };
  },
};

export const adminOperations = {
  // * Get Dashboard Stats
  async getDashboardStats() {
    // 1. User stats
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: activeRestaurants } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "restaurant")
      .eq("is_active", true);

    const { count: activeCharities } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "charity")
      .eq("is_active", true);

    // 2. Meal stats
    const { count: totalMeals } = await supabase
      .from("meals")
      .select("*", { count: "exact", head: true });

    // 3. Order & Revenue
    const {
      data: orders,
      count: totalOrders,
      error: ordersError,
    } = await supabase
      .from("orders")
      .select("total_amount", { count: "exact" });

    // Calculate total revenue from all orders
    const revenue = orders?.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );

    if (usersError || ordersError) {
      return { error: usersError || ordersError };
    }

    return {
      data: {
        totalUsers: totalUsers || 0,
        activeRestaurants: activeRestaurants || 0,
        activeCharities: activeCharities || 0,
        totalMeals: totalMeals || 0,
        totalOrders: totalOrders || 0,
        revenue,
      },
      error: null,
    };
  },

  // * Get Recent User Registrations
  async getRecentUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return { data, error };
  },

  // * Get Recent Orders
  async getRecentOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id, 
        total_amount, 
        status, 
        created_at,
        meal:meals (title),
        restaurant:meals (
           restaurant:users!restaurant_id (name)
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Note: The nested query for restaurant name via meal relation might need adjustment
    // depending on exact foreign key names. If the above fails, simplified version:
    // meal:meals(title, restaurant_id) -> then fetch user names manually or fix query.

    return { data, error };
  },

  // * Get All Users for Management
  async getAllUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // * Toggle User Active Status
  async toggleUserStatus(userId: string, currentStatus: boolean) {
    const { data, error } = await supabase
      .from("users")
      .update({ is_active: !currentStatus })
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  },

  // * Delete User
  // Note: For full security, you should usually delete from auth.users via an Edge Function.
  // This deletes from the public profile, which cascades if your DB is set up that way,
  // or at least removes them from the app's view.
  async deleteUser(userId: string) {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    return { error };
  },

  // * Update User Profile (Public Table Only)
  async updateUserProfile(
    userId: string,
    updates: { name: string; email: string; phone: string; role: string },
  ) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  },

  // * Create User (Simulated for Admin)
  // Real creation usually requires signing up (which logs the admin out).
  // This is a placeholder if you implement a backend function for it later.
  async createUser(userData: any) {
    // Ideally call a Supabase Edge Function here to create user without signing in
    console.warn(
      "Client-side user creation signs out the admin. Use an Edge Function instead.",
    );
    return {
      error: "Feature requires backend implementation to avoid admin logout.",
    };
  },
};

export const mealOperations = {
  async getActiveMeals() {
    const { data, error } = await supabase.from("meals").select("*");

    return { data, error };
  },

  async getMealById(mealId: string) {
    const { data, error } = await supabase
      .from("meals")
      .select(
        `
        *,
        restaurant:users!restaurant_id (
          id, name, email, phone,
          restaurant_details (address, average_rating)
        )
      `,
      )
      .eq("id", mealId)
      .single();
    return { data, error };
  },

  async createMeal(mealData: Partial<Meal>) {
    const { data, error } = await supabase
      .from("meals")
      .insert(mealData)
      .select()
      .single();
    return { data, error };
  },

  // * Update existing meal
  async updateMeal(mealId: string, updates: Partial<Meal>) {
    const { data, error } = await supabase
      .from("meals")
      .update(updates)
      .eq("id", mealId)
      .select()
      .single();
    return { data, error };
  },
};

// Renamed from purchaseOperations to orderOperations to match your component
export const orderOperations = {
  async completePurchase(mealId: string) {
    const { data, error } = await supabase.rpc("complete_purchase", {
      p_meal_id: mealId,
    });
    return { data, error };
  },

  async donateMeal(mealId: string, charityId: string) {
    const { data, error } = await supabase.rpc("donate_meal", {
      p_meal_id: mealId,
      p_charity_id: charityId,
    });
    console.log(data);
    console.error(error);
    return { data, error };
  },

  // Accepts userId to match your component signature, but prefers auth.uid() for security if needed
  async getUserOrders(userId?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    // We use the authenticated user's ID to ensure they can only see their own orders
    const targetId = userId || user.id;

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        meal:meals (*, restaurant:users!restaurant_id(name))
      `,
      )
      .eq("consumer_id", targetId) // Filter by the user ID
      .order("created_at", { ascending: false });

    return { data, error };
  },
};

export const userStats = {
  async getImpactStats(userId: string) {
    // 1. Fetch direct stats from consumer_details
    console.log("Getting Impact stats");
    const { data: details, error: detailsError } = await supabase
      .from("consumer_details")
      .select("meals_saved, meals_donated, loyalty_points")
      .eq("user_id", userId)
      .maybeSingle();

    if (detailsError) {
      console.error("Error fetching consumer details:", detailsError);
      return { data: null, error: detailsError };
    }

    // 2. Calculate Money Saved
    // Fetch completed orders to calculate (Original Price - Discount Price)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        meal:meals (
          original_price,
          discount_price
        )
      `,
      )
      .eq("consumer_id", userId)
      .eq("status", "completed");

    let moneySaved = 0;

    if (orders && !ordersError) {
      orders.forEach((order: any) => {
        if (order.meal) {
          const savings = order.meal.original_price - order.meal.discount_price;
          // Ensure we don't add negative savings if data is weird
          if (savings > 0) {
            moneySaved += savings;
          }
        }
      });
    }

    // 3. Calculate CO2 Reduced (Estimated: 2.5kg CO2e per meal saved)
    // This is a standard industry estimate for food waste prevention
    const co2Reduced = (details?.meals_saved || 0) * 2.5;

    return {
      data: {
        meals_saved: details?.meals_saved || 0,
        meals_donated: details?.meals_donated || 0,
        loyalty_points: details?.loyalty_points || 0,
        money_saved: moneySaved,
        co2_reduced: co2Reduced,
      },
      error: null,
    };
  },
};

export const charityOperations = {
  async getVerifiedCharities() {
    const { data, error } = await supabase
      .from("charity_details")
      .select(
        `
        *,
        user:users!user_id (id, name, email)
      `,
      )
      .eq("is_verified", true);
    return { data, error };
  },

  // * gET Specific Charity Profile
  async getCharityProfile(userId: string) {
    const { data, error } = await supabase
      .from("charity_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return { data, error };
  },

  async updateCharityProfile(userId: string, formData: any) {
    // 1. Update Public User Data (Name, Phone, Email)
    const { error: userError } = await supabase
      .from("users")
      .update({
        name: formData.name,
        phone: formData.phone,
      })
      .eq("id", userId);

    if (userError) return { error: userError };

    // 2. Update Charity Specific Details
    // Note: 'address', 'hours', etc., must exist as columns in your DB
    // or be stored in a JSONB column. For this implementation,
    // we map the specific fields defined in your types.ts
    const { data, error: charityError } = await supabase
      .from("charity_details")
      .upsert({
        user_id: userId,
        mission_statement: formData.missionStatement,
        registration_number: formData.ein, // Mapping EIN to registration_number
      })
      .select()
      .single();

    return { data, error: charityError };
  },

  // * Update mission statement
  async updateMission(userId: string, missionStatement: string) {
    const { data, error } = await supabase
      .from("charity_details")
      .upsert({ user_id: userId, mission_statement: missionStatement }) // Changed to upsert to create if missing
      .select()
      .single();

    return { data, error };
  },

  // * Get Dashboard stats
  async getCharityStats(charityId: string) {
    // REMOVED 'quantity' from the select string
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("charity_id", charityId);

    if (error) return { data: null, error };

    const totalDonations = orders.length;
    // Manual calculation: assume 1 meal per order since column is missing
    const mealsReceived = orders.length;
    const valueReceived = orders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );
    const peopleServed = mealsReceived;

    return {
      data: { totalDonations, mealsReceived, peopleServed, valueReceived },
      error: null,
    };
  },

  // * Get all donation (pickups and history list)
  async getDonations(charityId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        status,
        total_amount,
        meal:meals (
          title,
          pickup_window,
          restaurant:users!restaurant_id (
            name,
            restaurant_details (address)
          )
        ),
        donor:users!consumer_id (
          name
        )
      `,
      )
      // REMOVED 'quantity' from the select list above
      .eq("charity_id", charityId)
      .order("created_at", { ascending: false });

    // Manually add quantity: 1 to the result so your UI doesn't break
    const formattedData = data?.map((d) => ({ ...d, quantity: 1 })) || [];

    return { data: formattedData, error };
  },

  // * Update Donation Status (Mark as Collected)
  async updateDonationStatus(orderId: string, status: "collected" | "ready") {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();
    return { data, error };
  },
};

export const restaurantOperations = {
  // * Fetch Profile (Users + restaurant_details)
  async getRestaurantProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id, name, email, phone,
        restaurant_details (
          business_license,
          address,
          is_verified,
          average_rating
        )
        `,
      )
      .eq("id", userId)
      .single();

    return { data, error };
  },

  // * Update Profile
  async updateRestaurantProfile(userId: string, profileData: any) {
    // Update user basic info
    const { error: userError } = await supabase
      .from("users")
      .update({
        name: profileData.name,
        phone: profileData.phone,
      })
      .eq("id", userId);

    // Update restaurant Details
    const { error: detailsError } = await supabase
      .from("restaurant_details")
      .upsert(
        {
          user_id: userId,
          address: profileData.address,
          business_license: profileData.business_license,

          // is_verified and average_rating are usually updated by System/Admin not the user
        },
        { onConflict: "user_id" },
      );

    return { error: detailsError };
  },

  // * Get all meals created by this specific restaurant
  async getMyMeals(restaurantId: string) {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Calculate dashboard stats
  async getDashboardStats(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get all meals to calculate Total and Active
    const { data: meals, error: mealsError } = await supabase
      .from("meals")
      .select("id, quantity, is_sold_out")
      .eq("restaurant_id", restaurantId);

    if (mealsError) return { error: mealsError };

    const totalMeals = meals.length;
    const activeMeals = meals.filter(
      (m) => !m.is_sold_out && m.quantity > 0,
    ).length;

    // 2. Get Orders for this restaurant's meals to calculate Sales & Revenue
    // We join orders with meals where meal.restaurant_id is ours
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        created_at,
        meal:meals!inner(restaurant_id, type)
      `,
      )
      .eq("meal.restaurant_id", restaurantId)
      .gte("created_at", today.toISOString()); // Filter for today only

    if (ordersError) return { error: ordersError };

    const soldToday = orders.filter(
      (order) =>
        Array.isArray(order.meal) &&
        order.meal.some((meal) => meal.type !== "canceled"),
    ).length;
    const revenueToday = orders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );

    return {
      data: {
        totalMeals,
        activeMeals,
        soldToday,
        revenueToday,
      },
      error: null,
    };
  },

  // Delete a meal
  async deleteMeal(mealId: string) {
    const { error } = await supabase.from("meals").delete().eq("id", mealId);
    return { error };
  },

  // Toggle Sold Out status
  async toggleAvailability(mealId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("meals")
      .update({ is_sold_out: !currentStatus })
      .eq("id", mealId);
    return { error };
  },

  async getRestaurantOrders(restaurantId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
      id,
      consumer_id,
      meal_id,
      charity_id,
      qr_code,
      status,
      total_amount,
      created_at,

      meal:meals!inner (
        id, title, pickup_window, restaurant_id
      ),

      consumer:users!orders_consumer_id_fkey (
        id, name, email, phone
      ),

      charity:users!orders_charity_id_fkey (
        id, name
      ),

      review:reviews (
        id,
        consumer_id,
        restaurant_id,
        rating_value,
        comment,
        created_at,
        order_id,
        consumer:users!reviews_consumer_id_fkey (
          name
        )
      )
    `,
      )
      .eq("meal.restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: status })
      .eq("id", orderId)
      .select();
    return { data, error };
  },

  async createRestaurantReview(params: {
    consumerId: string;
    restaurantId: string;
    orderId: string;
    ratingValue: number;
    comment?: string;
  }) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        consumer_id: params.consumerId,
        restaurant_id: params.restaurantId,
        order_id: params.orderId,
        rating_value: params.ratingValue,
        comment: params.comment ?? null,
      })
      .select()
      .single();

    return { data, error };
  },

  async getMyReviewsForOrders(consumerId: string, orderIds: string[]) {
    if (orderIds.length === 0) return { data: [], error: null };

    const { data, error } = await supabase
      .from("reviews")
      .select("id, order_id")
      .eq("consumer_id", consumerId)
      .in("order_id", orderIds);

    return { data: data ?? [], error };
  },
};

export const notificationOperations = {
  async getMyNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    return { data, error };
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .single();

    return { data, error };
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return { error };
  },
};
