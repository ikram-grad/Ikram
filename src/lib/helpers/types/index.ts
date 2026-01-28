export type UserRole = 'admin' | 'consumer' | 'restaurant' | 'charity';
export type MealType = 'individual' | 'magic_box';
export type OrderStatus = 'pending' | 'completed' | 'canceled' | 'donated' | 'ready';
export type PaymentMethod = 'credit_card' | 'wallet' | 'cash_on_pickup';

export interface User {
  id: string;
  email: string; // From auth.users but stored in public.users per schema
  name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface ConsumerDetails {
  user_id: string;
  loyalty_points: number;
  meals_saved: number;
  meals_donated: number;
}
export type ConsumerData = User & ConsumerDetails;


export interface RestaurantDetails {
  user_id: string;
  business_license?: string;
  address?: string;
  is_verified: boolean;
  average_rating: number; // decimal(2,1)
}
export type RestaurantData = User & RestaurantDetails;


export interface CharityDetails {
  user_id: string;
  registration_number?: string;
  mission_statement?: string;
  is_verified: boolean;
}
export type CharityData = User & CharityDetails;


export interface Meal {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  pickup_window: string; // timestamptz
  type: MealType;
  image_url?: string;
  is_sold_out: boolean;
  created_at: string;
  
  // Relations (Joined data)
  restaurant?: User; 

  // Ui helpers
  rating?: number;
  distance?: string;
}

export type SortOption = "newest" | "price_low" | "price_high" | "savings_high";
export type TypeFilter = "all" | Meal["type"];

export interface ReviewWithConsumer extends Review {
  consumer?: { name: string };
}

export interface Order {
  id: string;
  consumer_id: string;
  meal_id: string;
  charity_id?: string | null;
  qr_code: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;

  // Relations
  meal?: Meal;
  consumer?: User;
  charity?: User;

  review?: ReviewWithConsumer[] | ReviewWithConsumer | null;
}



export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  is_successful: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  consumer_id: string;
  restaurant_id: string;
  rating_value: number;
  comment?: string;
  created_at: string;
  order_id: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}