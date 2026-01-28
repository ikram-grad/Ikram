import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/authContext";
import { ImageWithFallback } from "./fallback/ImageWithFallback";
import { Clock, MapPin, RefreshCw, Star } from "lucide-react";
import { Meal, SortOption, TypeFilter } from "../lib/helpers/types";
import { mealOperations } from "../lib/helpers/api";
import { toast } from "sonner";
import { OrderFlowModal } from "./OrderFlowModal";

export function BrowsePage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter UI state
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await mealOperations.getActiveMeals();
    console.log(data);
    if (fetchError) {
      toast.error(`Error while fetching: ${fetchError}`);
      console.error(fetchError);
      setError(fetchError.message);
    } else {
      setMeals(data || []);
    }
    setLoading(false);
  };

  const handleMealClick = (meal: Meal) => {
    if (!user) {
      return;
    }

    setSelectedMeal(meal);
    setShowOrderModal(true);
  };

  // Derive unique types for the dropdown
  const availableTypes = useMemo(() => {
    const set = new Set(meals.map((m) => m.type).filter(Boolean));
    return Array.from(set);
  }, [meals]);

  // Derived list filter+sort (never mutate state)
  const filteredMeals = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = meals.filter((m) => {
      const soldOut = m.is_sold_out || m.quantity <= 0;

      if (availableOnly && soldOut) return false;
      if (type !== "all" && m.type !== type) return false;

      if (q) {
        const hay =
          `${m.title} ${m.description ?? ""} ${m.restaurant?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    const savingsPct = (m: Meal) =>
      m.original_price > 0
        ? ((m.original_price - m.discount_price) / m.original_price) * 100
        : 0;

    list = list.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.discount_price - b.discount_price;
        case "price_high":
          return b.discount_price - a.discount_price;
        case "savings_high":
          return savingsPct(b) - savingsPct(a);
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return list;
  }, [meals, search, type, availableOnly]);

  const handleEmptyMeals = (empty: boolean) => {
    if (!empty) {
      // if not empty then false
      return false;
    }
    // if empty then true;
    return true;
  };

  const handleOrderSuccess = () => {
    // still not implemented.
  };

  return (
    <section id="browse" className="ikram-browse">
      <div className="ikram-browse-container">
        {/* Header */}
        <div className="ikram-browse-header">
          <div>
            <h2 className="ikram-browse-title">BROWSE MEALS</h2>
            <p className="ikram-browse-subtitle">
              Premium dishes available for rescue today
            </p>
          </div>

          <button onClick={loadMeals} disabled={loading} className="ikram-browse-refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters Bar */}
        {meals.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meals or restaurants..."
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Type */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeFilter)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {String(t).replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low</option>
                <option value="price_high">Price: High</option>
                <option value="savings_high">Best Savings</option>
              </select>

              {/* Available only */}
              <label className="flex items-center gap-2 text-sm select-none px-2">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                Available only
              </label>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearch("");
                  setType("all");
                  setAvailableOnly(true);
                  setSortBy("newest");
                }}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && meals.length === 0 && (
          <div className="ikram-browse-loading">
            <div className="ikram-browse-spinner" />
            <p className="ikram-browse-loading-text">Loading available meals...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-900 p-8 mb-8 rounded">
            <p className="text-lg mb-2">Error loading meals</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty (after filtering) */}
        {!loading && !error && meals.length > 0 && filteredMeals.length === 0 && (
          <div className="ikram-browse-empty">
            <h3 className="ikram-browse-empty-title">No results</h3>
            <p className="ikram-browse-empty-text">Try changing filters or search.</p>
            <button
              onClick={() => {
                setSearch("");
                setType("all");
                setAvailableOnly(true);
                setSortBy("newest");
              }}
              className="ikram-hero-cta ikram-hero-cta-primary"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Empty (no meals at all) */}
        {!loading && meals.length === 0 && !error && (
          <div className="ikram-browse-empty">
            <h3 className="ikram-browse-empty-title">No Meals Available</h3>
            <p className="ikram-browse-empty-text">Check back soon for new rescued meals</p>
            <button onClick={loadMeals} className="ikram-hero-cta ikram-hero-cta-primary">
              Refresh
            </button>
          </div>
        )}

        {/* Grid */}
        {filteredMeals.length > 0 && (
          <div className="ikram-browse-grid">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={() => handleMealClick(meal)}
                disabled={meal.is_sold_out || meal.quantity <= 0}
              />
            ))}
          </div>
        )}
      </div>

      <OrderFlowModal
        meal={selectedMeal}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedMeal(null);
        }}
        onSuccess={handleOrderSuccess}
      />
    </section>
  );
}

function MealCard({
  meal,
  onClick,
  disabled,
}: {
  meal: Meal;
  onClick: () => void;
  disabled: boolean;
}) {
  const isMagicBox = meal.type === "magic_box";

  if (isMagicBox) {
    return <MagicBoxCard meal={meal} onClick={onClick} disabled={disabled} />;
  }

  const pickupTime = new Date(meal.pickup_window).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const savingsPercent = Math.round(
    ((meal.original_price - meal.discount_price) / meal.original_price) * 100,
  );

  return (
    <div
      className="group cursor-pointer"
      onClick={disabled ? undefined : onClick}
    >
      <div className="ikram-meal-card">
        {/* Image Container */}
        <div className="ikram-meal-image-container">
          <div className="ikram-meal-image-wrapper">
            <ImageWithFallback
              src={meal.image_url}
              alt={meal.title}
              className="ikram-meal-image"
            />
          </div>

          {/* Quantity Badge */}
          {meal.quantity <= 3 && (
            <div className="ikram-meal-badge ikram-meal-badge-quantity">
              Only {meal.quantity} left
            </div>
          )}

          {/* Savings Badge */}
          <div className="ikram-meal-badge ikram-meal-badge-savings">
            {savingsPercent}% OFF
          </div>
        </div>

        {/* Restaurant Name */}
        <div className="ikram-meal-restaurant">
          {meal.restaurant?.name || "Restaurant"}
        </div>

        {/* Meal Name */}
        <h3 className="ikram-meal-title">{meal.title}</h3>

        {/* Info Row */}
        <div className="ikram-meal-info">
          <div className="ikram-meal-info-item">
            <Clock className="ikram-meal-info-icon" />
            <span>{pickupTime}</span>
          </div>
          {meal.distance && (
            <div className="ikram-meal-info-item">
              <MapPin className="ikram-meal-info-icon" />
              <span>{meal.distance}</span>
            </div>
          )}
          {meal.rating && (
            <div className="ikram-meal-info-item">
              <Star className="ikram-meal-info-icon" />
              <span>{meal.rating}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="ikram-meal-price-section">
          <div className="ikram-meal-price-wrapper">
            <div className="ikram-meal-price-original">
              <span>${meal.original_price}</span>
            </div>
            <div className="ikram-meal-price-discounted">
              ${meal.discount_price}
            </div>
          </div>
          <button disabled={disabled} className="ikram-meal-reserve">
            <span className="ikram-meal-reserve-text">
              {disabled ? "Out of Order" : "Reserve"}
            </span>
            <div className="ikram-meal-reserve-bg" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MagicBoxCard({
  meal,
  onClick,
  disabled,
}: {
  meal: Meal;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div onClick={disabled ? undefined : onClick}>
      <div className="ikram-magic-box-card">
        {/* Decorative Pattern */}
        <div className="ikram-magic-box-pattern">
          <div className="ikram-magic-box-circle-1" />
          <div className="ikram-magic-box-circle-2" />
        </div>

        {/* Content */}
        <div className="ikram-magic-box-content">
          <div className="ikram-magic-box-icon">?</div>
          <h3 className="ikram-magic-box-title">MYSTERY CRATE</h3>
          <p className="ikram-magic-box-subtitle">{meal.title}</p>
        </div>

        {/* Description */}
        <div className="ikram-magic-box-description">{meal.description}</div>

        {/* Quantity Badge */}
        {meal.quantity <= 3 && (
          <div className="ikram-magic-box-quantity">
            Only {meal.quantity} remaining
          </div>
        )}

        {/* Price Section */}
        <div className="ikram-magic-box-price-section">
          <div>
            <div className="ikram-magic-box-price-original">
              <span>${meal.original_price}+</span>
            </div>
            <div className="ikram-magic-box-price-discounted">
              ${meal.discount_price}
            </div>
          </div>
          <button disabled={disabled} className="ikram-magic-box-button">
            {disabled ? "Out of order" : " Claim Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
