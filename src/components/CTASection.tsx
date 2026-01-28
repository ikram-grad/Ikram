import { useAuth } from "../context/authContext";
import { UserRole } from "../lib/helpers/types";

type CTASectionProps = {
  onAuthClick?: () => void;
};

export function CTASection({ onAuthClick }: CTASectionProps) {
  const { userProfile } = useAuth();

  const handleButtons = (btnName: "rest" | "consumer") => {
    // Restaurant button
    if (btnName === "rest") {
      if (userProfile?.role !== "restaurant" && userProfile) {
        alert("Contact Administration to become a restaurant.");
        return;
      }

      onAuthClick?.();
      return;
    }

    // Consumer button
    if (btnName === "consumer") {
      if (!userProfile) {
        onAuthClick?.(); // 👈 THIS is what you wanted
        return;
      }

      // continue consumer logic here
      alert("You already logged in!");
    }
  };
  return (
    <section className="ikram-cta">
      {/* Background Pattern */}
      <div className="ikram-cta-pattern" />

      <div className="ikram-cta-container">
        <h2 className="ikram-cta-title">JOIN THE MOVEMENT</h2>

        <p className="ikram-cta-subtitle">
          Whether you're a restaurant owner or a conscious consumer, there's a
          place for you in our community. Start making a difference today.
        </p>

        <div className="ikram-cta-buttons">
          <button
            onClick={() => {
              handleButtons("rest");
            }}
            className="ikram-hero-cta ikram-cta-btn-dark"
          >
            For Restaurants
          </button>
          <button
            onClick={() => {
              handleButtons("consumer");
            }}
            className="ikram-hero-cta ikram-cta-btn-light"
          >
            Start Rescuing
          </button>
        </div>

        {/* Social Proof */}
        <div className="ikram-cta-social-proof">
          <div className="ikram-cta-stats">
            <div className="ikram-cta-stat">
              <div className="ikram-cta-stat-value">50K+</div>
              <div className="ikram-cta-stat-label">Happy Diners</div>
            </div>
            <div className="ikram-cta-stat">
              <div className="ikram-cta-stat-value">150+</div>
              <div className="ikram-cta-stat-label">Partner Restaurants</div>
            </div>
            <div className="ikram-cta-stat">
              <div className="ikram-cta-stat-value">4.8★</div>
              <div className="ikram-cta-stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
