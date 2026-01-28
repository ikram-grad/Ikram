import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, QrCode, Package, Star } from "lucide-react";
import { orderOperations, restaurantOperations } from "../lib/helpers/api";
import { useAuth } from "../context/authContext";
import { ImageWithFallback } from "./fallback/ImageWithFallback";
import { Order } from "../lib/helpers/types";
import { LoadingContainer } from "./ui/loading";

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent re-rating the same ORDER (not the restaurant)
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error } = await orderOperations.getUserOrders(user.id);

    if (error) {
      setError(error.toString());
      setOrders([]);
      setReviewedOrders(new Set());
      setLoading(false);
      return;
    }

    const ordersList = data || [];
    setOrders(ordersList);

    // Only completed/donated orders need review check
    const eligibleOrderIds = ordersList
      .filter((o: any) => o.status === "completed" || o.status === "donated")
      .map((o: any) => o.id);

    if (eligibleOrderIds.length > 0) {
      const { data: reviews, error: rErr } =
        await restaurantOperations.getMyReviewsForOrders(user.id, eligibleOrderIds);

      if (!rErr) {
        setReviewedOrders(new Set((reviews ?? []).map((r: any) => r.order_id)));
      } else {
        console.error(rErr);
        setReviewedOrders(new Set());
      }
    } else {
      setReviewedOrders(new Set());
    }

    setLoading(false);
  };

  if (loading) return LoadingContainer();

  if (error) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center p-8">
        <div className="bg-red-500/20 text-red-900 p-8 max-w-md">
          <p className="text-lg mb-2">Error loading orders</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] py-32 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-[10vw] md:text-[7rem] leading-[0.9] tracking-tighter mb-8 text-white">
            YOUR <span className="text-[#C88D00]">ORDERS</span>
          </h1>
          <p className="text-xl text-neutral-400">
            Track your rescued meals and pickup details
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-[1400px] mx-auto py-16 px-8 md:px-16">
        {orders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-6 text-neutral-400" />
            <h3 className="text-3xl tracking-tighter mb-4">No Orders Yet</h3>
            <p className="text-neutral-700 mb-8">
              Start rescuing meals to see your orders here
            </p>
            <a
              href="#browse"
              className="inline-block px-8 py-4 bg-[#C88D00] text-white text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
            >
              Browse Meals
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReviewed={loadOrders}
                reviewedOrders={reviewedOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onReviewed,
  reviewedOrders,
}: {
  order: Order;
  onReviewed: () => void;
  reviewedOrders: Set<string>;
}) {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const restaurantId = useMemo(() => {
    const anyOrder: any = order as any;
    return (
      anyOrder?.meal?.restaurant_id ||
      anyOrder?.meal?.restaurant?.user_id ||
      anyOrder?.meal?.restaurant?.id ||
      null
    );
  }, [order]);

  const restaurantName = useMemo(() => {
    const anyOrder: any = order as any;
    return anyOrder?.meal?.restaurant?.name || "Restaurant";
  }, [order]);

  const canReview =
    (order.status === "completed" || order.status === "donated") &&
    !!restaurantId;

  // ✅ Only block review if THIS order already reviewed
  const alreadyReviewedThisOrder = reviewedOrders.has(order.id);

  const closeReview = () => {
    setShowReview(false);
    setReviewError(null);
    setRating(5);
    setComment("");
  };

  const submitReview = async () => {
    if (!user) {
      setReviewError("You must be logged in to review.");
      return;
    }
    if (!restaurantId) {
      setReviewError("Restaurant info is missing for this order.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setReviewError("Rating must be between 1 and 5.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      const { error } = await restaurantOperations.createRestaurantReview({
        consumerId: user.id,
        restaurantId,
        orderId: order.id, // ✅ KEY LINE
        ratingValue: rating,
        comment: comment?.trim() ? comment.trim() : undefined,
      });

      if (error) throw error;

      closeReview();
      onReviewed();
    } catch (e: any) {
      setReviewError(e?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-900";
      case "pending":
        return "bg-[#C88D00]/20 text-[#1A1A1A]";
      case "donated":
        return "bg-purple-500/20 text-purple-900";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Ready for Pickup";
      case "donated":
        return "Donated";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-8 hover:bg-white/80 transition-colors">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Meal Image */}
        {order.meal && (
          <div className="w-full md:w-48 h-48 flex-shrink-0">
            <ImageWithFallback
              src={order.meal.image_url}
              alt={order.meal.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Order Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl tracking-tight mb-2">
                {order.meal?.title || "Meal"}
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                Order ID: {order.id.slice(0, 8)}...
              </p>
            </div>

            <div
              className={`px-4 py-2 text-xs tracking-widest uppercase ${getStatusColor(order.status)}`}
            >
              {getStatusText(order.status)}
            </div>
          </div>

          {order.meal && (
            <>
              <p className="text-neutral-700 mb-4">{order.meal.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Pickup: {new Date(order.meal.pickup_window).toLocaleString()}
                  </span>
                </div>

                {order.meal.restaurant?.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{order.meal.restaurant.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10">
                <div className="text-3xl tracking-tight">
                  ${order.meal.discount_price}
                </div>

                {order.status === "pending" && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#C88D00] text-white text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
                    type="button"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR ? "Hide QR" : "Show QR Code"}
                  </button>
                )}

                {/* Review button per-order */}
                {canReview && !alreadyReviewedThisOrder && (
                  <button
                    onClick={() => setShowReview(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-[#1A1A1A]/20 text-[#1A1A1A] text-sm tracking-widest uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    type="button"
                  >
                    <Star className="w-4 h-4" />
                    Rate Restaurant
                  </button>
                )}

                {canReview && alreadyReviewedThisOrder && (
                  <div className="px-6 py-3 text-sm tracking-widest uppercase bg-green-500/10 text-green-900 border border-green-500/20">
                    Rated ✓
                  </div>
                )}
              </div>

              {/* QR Code Display */}
              {showQR && order.qr_code && (
                <div className="mt-6 p-8 bg-white border-2 border-[#C88D00] text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-neutral-200 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-600">
                    Show this QR code at pickup
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Code: {order.qr_code}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-md bg-white p-8 border border-[#1A1A1A]/10">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl tracking-tight">Rate {restaurantName}</h3>
              <button
                onClick={closeReview}
                className="text-neutral-600 hover:text-black"
                type="button"
              >
                ✕
              </button>
            </div>

            {reviewError && (
              <div className="mb-4 bg-red-500/10 text-red-900 border border-red-500/20 p-3 text-sm">
                {reviewError}
              </div>
            )}

            <label className="block text-sm text-neutral-700 mb-2">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-[#1A1A1A]/20 p-3 mb-4 outline-none focus:border-[#C88D00]"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>

            <label className="block text-sm text-neutral-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-[#1A1A1A]/20 p-3 h-28 mb-6 outline-none focus:border-[#C88D00]"
              placeholder="Tell us how it was..."
            />

            <button
              disabled={reviewLoading}
              onClick={submitReview}
              className="w-full bg-[#C88D00] text-white py-3 text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors disabled:opacity-60"
              type="button"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
