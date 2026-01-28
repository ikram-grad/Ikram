import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/authContext";
import { ReviewDisplay, ReviewsSummary } from "./ReviewDisplay";
import { Order } from "../../lib/helpers/types";
import { restaurantOperations } from "../../lib/helpers/api";

interface RestaurantOrdersProps {
  onNavigate?: (page: string) => void;
}

export function RestaurantOrders({ onNavigate }: RestaurantOrdersProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "ready" | "completed" | "canceled"
  >("all");

  const [stats, setStats] = useState({
    pending: 0,
    readyForPickup: 0,
    completed: 0,
    canceled: 0,
  });

  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (user) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await restaurantOperations.getRestaurantOrders(
        user.id
      );

      if (error) throw error;

      const list = (data as Order[]) || [];
      setOrders(list);
      calculateStats(list);
      calculateReviewStats(list);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Order[]) => {
    setStats({
      pending: data.filter((o) => o.status === "pending").length,
      readyForPickup: data.filter((o) => o.status === "ready").length,
      completed: data.filter((o) => o.status === "completed").length,
      canceled: data.filter((o) => o.status === "canceled").length,
    });
  };

  // Normalize review (Supabase may return review: [] or review: [{...}] or sometimes object)
  const getReview = (order: any) => {
    const r = order?.review;
    if (!r) return null;
    if (Array.isArray(r)) return r[0] ?? null;
    return r;
  };

  const calculateReviewStats = (data: Order[]) => {
    const reviewedOrders = data.filter((o: any) => !!getReview(o));
    const totalReviews = reviewedOrders.length;

    if (totalReviews === 0) {
      setReviewStats({ averageRating: 0, totalReviews: 0 });
      return;
    }

    const totalRating = reviewedOrders.reduce((sum, o: any) => {
      const r = getReview(o);
      return sum + (r?.rating_value || 0);
    }, 0);

    setReviewStats({
      averageRating: totalRating / totalReviews,
      totalReviews,
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? ({ ...o, status: newStatus } as Order) : o
      )
    );

    const { error } = await restaurantOperations.updateOrderStatus(
      orderId,
      newStatus
    );

    if (error) {
      console.error("Failed to update status", error);
      fetchOrders();
      return;
    }

    // Recalc stats based on latest local state
    const updated = orders.map((o) =>
      o.id === orderId ? ({ ...o, status: newStatus } as Order) : o
    );
    calculateStats(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-600";
      case "ready":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "ready":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateString: string) => {
    const minutes = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 60000
    );
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const filteredOrders = useMemo(() => {
    return filter === "all" ? orders : orders.filter((o) => o.status === filter);
  }, [filter, orders]);

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
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-[#C88D00]" />
            <h1 className="text-4xl md:text-5xl tracking-tighter text-white">
              ORDERS
            </h1>
          </div>
          <p className="text-white/60 tracking-wide">
            Manage customer orders and pickups
          </p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Reviews Summary */}
        {reviewStats.totalReviews > 0 && (
          <div className="mb-8">
            <ReviewsSummary
              averageRating={reviewStats.averageRating}
              totalReviews={reviewStats.totalReviews}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Pending
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.pending}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-blue-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Ready
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.readyForPickup}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Completed
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.completed}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Cancelled
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.canceled}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "pending", "ready", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-3 text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-[#C88D00] text-black"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
              type="button"
            >
              {f} Orders
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              No {filter !== "all" ? filter : ""} orders found.
            </div>
          )}

          {filteredOrders.map((order: any) => {
            const review = getReview(order);

            return (
              <div
                key={order.id}
                className="bg-white border-l-4 border-[#C88D00]"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl text-[#1A1A1A]">
                          {order.meal?.title || "Deleted Meal"}
                        </h4>

                        {/* Charity badge */}
                        {order.charity_id && (
                          <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs tracking-widest uppercase">
                            Donation
                          </span>
                        )}

                        {/* Review badge */}
                        {review && (
                          <span className="ikram-review-badge">
                            <Star size={14} />
                            {Number(review.rating_value).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-neutral-500 mb-3">
                        Order ID:{" "}
                        <span className="text-[#1A1A1A]">
                          {order.id.slice(0, 8)}...
                        </span>{" "}
                        • {timeAgo(order.created_at)}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#C88D00]" />
                        <span className="text-neutral-700">
                          Pickup Window:{" "}
                          {order.meal?.pickup_window
                            ? formatTime(order.meal.pickup_window)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      <div className="text-right">
                        <div className="text-sm text-neutral-500">Total</div>
                        <div
                          className={`text-2xl ${
                            order.charity_id
                              ? "text-rose-600"
                              : "text-[#C88D00]"
                          }`}
                        >
                          {order.charity_id
                            ? "Donated"
                            : `$${order.total_amount?.toFixed(2)}`}
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-700">
                          {order.consumer?.name || "Unknown User"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-700">
                          {order.consumer?.phone || "No Phone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-700">
                          {order.consumer?.email || "No Email"}
                        </span>
                      </div>
                    </div>

                    {/* Review Display - only completed */}
                    {order.status === "completed" && (
                      <ReviewDisplay
                        review={review ?? undefined}
                        orderCreatedAt={order.created_at}
                      />
                    )}

                    {/* Action Buttons */}
                    {order.status === "pending" && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() => handleStatusUpdate(order.id, "ready")}
                          className="px-6 py-2 bg-[#C88D00] text-black text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
                          type="button"
                        >
                          Mark as Ready
                        </button>
                        <button
                          className="px-6 py-2 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase hover:bg-neutral-300 transition-colors"
                          type="button"
                        >
                          Contact Customer
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "canceled")
                          }
                          className="px-6 py-2 bg-red-100 text-red-700 text-sm tracking-widest uppercase hover:bg-red-200 transition-colors"
                          type="button"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}

                    {order.status === "ready" && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "completed")
                          }
                          className="px-6 py-2 bg-green-500 text-white text-sm tracking-widest uppercase hover:bg-green-600 transition-colors"
                          type="button"
                        >
                          Mark as Completed
                        </button>
                        <button
                          className="px-6 py-2 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase hover:bg-neutral-300 transition-colors"
                          type="button"
                        >
                          Contact Customer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
