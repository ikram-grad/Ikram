import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import {
  mealOperations,
  restaurantOperations,
  notificationOperations,
  authHelpers,
} from "../../lib/helpers/api";
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Loader2,
  ImageIcon,
  X,
  Power,
  Edit,
} from "lucide-react";
import { Meal, Notification } from "../../lib/helpers/types";
import { supabase } from "../../lib/supabase";

interface RestaurantDashboardProps {
  onNavigate?: (page: string) => void;
}

export function RestaurantDashboard({ onNavigate }: RestaurantDashboardProps) {
  // State
  const { userProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState({
    totalMeals: 0,
    activeMeals: 0,
    soldToday: 0,
    revenueToday: 0,
  });

  // Form state
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_price: "",
    discount_price: "",
    quantity: "",
    pickup_time_start: "",
    pickup_time_end: "", // Note: DB schema usually has one timestamp, we'll store start time
    image_url: "", // Image URL
    type: "individual" as "individual" | "magic_box",
  });

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Fetch on load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    if (onNavigate) onNavigate("home");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!userProfile) {
        handleSignOut();
      }

      // Fetch stats
      const { data: statData } = await restaurantOperations.getDashboardStats(
        userProfile!.id,
      );
      if (statData) setStats(statData);

      // Fetch meals
      const { data: mealData } = await restaurantOperations.getMyMeals(
        userProfile!.id,
      );
      if (mealData) setMeals(mealData);

      // Fetch notifications
      const { data: notifData } =
        await notificationOperations.getMyNotifications(userProfile!.id);
      if (!notifData) console.log("No Notification exists.");
      const list = (notifData ?? []) as Notification[];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading dashboard: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Real time recieving notifications
  useEffect(() => {
    if (!userProfile?.id) return;

    const sub = authHelpers.subscribeToRestaurantNotifications(userProfile.id, {
      onInsert: (n) => {
        setNotifications((prev) => [n, ...prev]);
        setUnreadCount((c) => c + (n.is_read ? 0 : 1));
      },
      onUpdate: (n) => {
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        // optionally recompute unreadCount here
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [userProfile?.id]);

  // 2. handle form changes
  const handleInputChanges = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_price: "",
      original_price: "",
      pickup_time_end: "",
      pickup_time_start: "",
      type: "individual",
      quantity: "",
      image_url: "",
    });
    setEditingId(null);
    setShowAddMeal(false);
  };

  // Handle edit click
  const handleEditClick = (meal: Meal) => {
    const pickupDate = new Date(meal.pickup_window);

    //Format time as HH:mm for input
    const timeString = pickupDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setFormData({
      title: meal.title,
      description: meal.description || "",
      original_price: meal.original_price.toString(),
      discount_price: meal.discount_price.toString(),
      quantity: meal.quantity.toString(),
      pickup_time_start: timeString,
      pickup_time_end: "", // We don't store end time in DB, user needs to re-enter or we parse description
      image_url: meal.image_url || "",
      type: meal.type,
    });
    setEditingId(meal.id);
    setShowAddMeal(true);

    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Handle Create Meals
  const handleSave = async () => {
    if (!userProfile) return handleSignOut();

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const pickupTimestamp = new Date(
        `${today}T${formData.pickup_time_start}:00`,
      ).toISOString();

      let fullDescription = formData.description;
      if (formData.pickup_time_end) {
        fullDescription = `${formData.description} (Pickup until ${formData.pickup_time_end})`;
      }

      const commonData = {
        title: formData.title,
        description: fullDescription,
        original_price: parseFloat(formData.original_price),
        discount_price: parseFloat(formData.discount_price),
        quantity: parseInt(formData.quantity),
        pickup_window: pickupTimestamp,
        type: formData.type,
        image_url: formData.image_url, // Save image URL
      };

      if (editingId) {
        // ! UPDATE MODE
        const { error } = await mealOperations.updateMeal(
          editingId,
          commonData,
        );
        if (error) throw error;
      } else {
        // ! CREATE MODE
        const newMeal = {
          restaurant_id: userProfile?.id,
          ...commonData,
          is_sold_out: false,
        };
        const { error } = await mealOperations.createMeal(newMeal);
        if (error) throw error;
      }

      // * REST AND RELOAD
      resetForm();
      fetchDashboardData();
    } catch (error) {
      console.error("Error saving meal: ", error);
      alert("Failed to save meal. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meal?")) {
      await restaurantOperations.deleteMeal(id);
      fetchDashboardData();
    }
  };

  // 5. handle toggle status
  const handleToggleStatus = async (meal: Meal) => {
    await restaurantOperations.toggleAvailability(meal.id, meal.is_sold_out);
    fetchDashboardData();
  };

  const handleReadingNotification = async (notif: Notification) => {
    const { error } = await notificationOperations.markAsRead(notif.id);
    if (error) {
      console.error("Notifications: ", error);
    }
    return;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C88D00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="relative bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto pr-16">
          <h1 className="text-4xl md:text-5xl tracking-tighter text-white mb-2">
            RESTAURANT DASHBOARD
          </h1>
          <p className="text-white/60 tracking-wide">
            Manage your meals and inventory
          </p>
        </div>

        {/* Notifications (top-right) */}
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative p-3 bg-white/10 hover:bg-white/20 text-white transition"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 text-xs bg-[#C88D00] text-black flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-3 w-96 bg-white shadow-xl border border-black/10 z-50">
                <div className="px-4 py-3 border-b text-sm font-semibold">
                  Notifications
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-neutral-500 text-center">
                    No notifications yet
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b cursor-pointer hover:bg-neutral-100 ${
                          !n.is_read ? "bg-[#C88D00]/10" : ""
                        }`}
                        onClick={() => handleReadingNotification(n)}
                      >
                        <div className="text-neutral-900">{n.message}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-[#C88D00]">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-[#C88D00]" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Total Meals
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.totalMeals}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Active
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.activeMeals}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Sold Today
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.soldToday}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-rose-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Today
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">${stats.revenueToday}</div>
          </div>
        </div>

        {/* ADD/EDIT Meal Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (showAddMeal)
                resetForm(); // Close if open
              else setShowAddMeal(true); // Open clean form
            }}
            className="flex items-center gap-3 px-8 py-4 bg-[#C88D00] text-black hover:bg-[#B07D00] transition-all"
          >
            {showAddMeal ? (
              <X className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span className="tracking-widest uppercase text-sm">
              {showAddMeal ? "Cancel Operation" : "Add New Meal"}
            </span>
          </button>
        </div>

        {/* Add Meal Form */}
        {showAddMeal && (
          <div className="bg-white p-8 mb-8 border-l-4 border-[#C88D00]">
            <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A] mb-6">
              {editingId ? "Edit Meal Details" : "New Meal"}
            </h3>

            {/* Meal Type */}
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "individual" })
                  }
                  className={`p-4 text-sm tracking-widest uppercase transition-colors ${
                    formData.type === "individual"
                      ? "bg-[#C88D00] text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  Individual Meal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "magic_box" })
                  }
                  className={`p-4 text-sm tracking-widest uppercase transition-colors ${
                    formData.type === "magic_box"
                      ? "bg-[#C88D00] text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  Magic Box
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Meal Title
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChanges}
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="e.g., Premium Sushi Box"
                />
              </div>

              {/*NEW: Image URL Input */}
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Image URL
                  <span className="ml-2 text-neutral-400 lowercase font-normal">
                    (optional)
                  </span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-12 bg-neutral-200">
                    <ImageIcon className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChanges}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChanges}
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Original Price
                </label>
                <input
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChanges}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="e.g., 45.00"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Discount Price
                </label>
                <input
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleInputChanges}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="e.g., 25.99"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChanges}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="Describe your meal..."
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Pickup Window Start
                </label>
                <input
                  name="pickup_time_start"
                  value={formData.pickup_time_start}
                  onChange={handleInputChanges}
                  type="time"
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Pickup Window End
                </label>
                <input
                  name="pickup_time_end"
                  value={formData.pickup_time_end}
                  onChange={handleInputChanges}
                  type="time"
                  className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="px-8 py-3 bg-[#C88D00] text-black text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
              >
                {submitting
                  ? "Saving ..."
                  : editingId
                    ? "Update Meal"
                    : "Create Meal"}
              </button>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meals List */}
        <div className="space-y-6">
          <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A]">
            Your Meals
          </h3>

          {meals.length === 0 && !loading && (
            <div className="text-neutral-500 py-8">
              No meals found. Create one to get started!
            </div>
          )}

          {meals.map((meal) => (
            <div
              key={meal.id}
              className={`bg-white p-6 border-l-4 ${meal.is_sold_out ? "border-neutral-300 opacity-75" : "border-[#C88D00]"} hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    {/*Show Image Thumbnail if exists */}
                    {meal.image_url && (
                      <div className="w-16 h-16 bg-neutral-100 shrink-0 overflow-hidden rounded-md">
                        <img
                          src={meal.image_url}
                          alt={meal.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-xl text-[#1A1A1A] mb-1">
                        {meal.title}
                      </h4>
                      <p className="text-sm text-neutral-600 mb-2">
                        {meal.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {/* Format ISO string to Time */}
                          {new Date(meal.pickup_window).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {meal.quantity} available
                        </span>
                        <span
                          className={`px-3 py-1 text-xs tracking-widest uppercase ${
                            meal.type === "magic_box"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {meal.type === "magic_box"
                            ? "Magic Box"
                            : "Individual"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3">
                  <div className="text-right">
                    <div className="text-sm text-neutral-400 line-through">
                      ${meal.original_price}
                    </div>
                    <div className="text-2xl text-[#C88D00]">
                      ${meal.discount_price}
                    </div>
                    <div className="text-xs text-green-600 tracking-wide">
                      {Math.round(
                        (1 - meal.discount_price / meal.original_price) * 100,
                      )}
                      % OFF
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* 1. Toggle Status / Freeze Button */}
                    <button
                      onClick={() => handleToggleStatus(meal)}
                      className={`p-2 transition-colors ${meal.is_sold_out ? "bg-green-100 text-green-700" : "bg-neutral-100 hover:bg-[#C88D00] hover:text-white"}`}
                      title={
                        meal.is_sold_out ? "Mark Available" : "Mark Sold Out"
                      }
                      aria-placeholder={
                        meal.is_sold_out ? "Mark Available" : "Mark Sold Out"
                      }
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* 2. Edit Details Button */}
                    <button
                      onClick={() => handleEditClick(meal)}
                      className="p-2 bg-neutral-100 hover:bg-[#C88D00] hover:text-white transition-colors"
                      title="Edit Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="p-2 bg-neutral-100 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {meal.is_sold_out && (
                    <span className="px-4 py-1 bg-red-100 text-red-700 text-xs tracking-widest uppercase">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
