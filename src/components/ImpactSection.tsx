import { TrendingDown, Users, Leaf, DollarSign } from 'lucide-react';

const impactStats = [
  {
    id: 1,
    icon: TrendingDown,
    value: "250K",
    unit: "KG",
    label: "Food Waste Prevented",
    description: "Equivalent to 625,000 meals saved from landfills"
  },
  {
    id: 2,
    icon: Leaf,
    value: "1.2M",
    unit: "KG",
    label: "CO₂ Emissions Reduced",
    description: "Same impact as planting 54,000 trees annually"
  },
  {
    id: 3,
    icon: Users,
    value: "85K",
    unit: "+",
    label: "Active Rescuers",
    description: "Community members making a difference daily"
  },
  {
    id: 4,
    icon: DollarSign,
    value: "$4.2M",
    unit: "",
    label: "Saved by Community",
    description: "Premium dining at accessible prices"
  }
];

const partnerRestaurants = [
  { name: "The Grand Table", saved: "12,500 kg" },
  { name: "Mizuki", saved: "8,200 kg" },
  { name: "Casa Italiana", saved: "9,800 kg" },
  { name: "Oceanique", saved: "11,300 kg" },
  { name: "Patisserie Noir", saved: "6,400 kg" },
  { name: "The Butcher's Block", saved: "7,900 kg" }
];

export function ImpactSection() {
  return (
   <section className="ikram-impact">
      {/* Background Decoration */}
      <div className="ikram-impact-bg-decoration" />
      
      <div className="ikram-impact-container">
        {/* Section Header */}
        <div className="ikram-impact-header">
          <h2 className="ikram-impact-title">
            MEASURED IMPACT
          </h2>
          <p className="ikram-impact-description">
            Every rescued meal creates a ripple effect. Track the collective impact 
            of our community in real-time as we fight food waste together.
          </p>
        </div>

        {/* Impact Stats Grid */}
        <div className="ikram-impact-stats">
          {impactStats.map((stat) => (
            <div key={stat.id} className="ikram-impact-stat-card">
              {/* Icon */}
              <div className="ikram-impact-icon">
                <stat.icon size={32} strokeWidth={2.5} />
              </div>
              
              {/* Value */}
              <div className="ikram-impact-value">
                {stat.value}
                {stat.unit && <span className="ikram-impact-value-unit">{stat.unit}</span>}
              </div>

              {/* Label */}
              <div className="ikram-impact-label">
                {stat.label}
              </div>

              {/* Description */}
              <p className="ikram-impact-stat-description">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="ikram-how-it-works">
          <h2 className="ikram-how-it-works-title">
            HOW IT WORKS
          </h2>

          <div className="ikram-steps-grid">
            {/* Step 1 */}
            <div className="ikram-step">
              <div className="ikram-step-number">01</div>
              <h3 className="ikram-step-title">Restaurants List</h3>
              <p className="ikram-step-description">
                Partner restaurants upload their surplus premium dishes at the end of service. 
                Quality remains uncompromised.
              </p>
            </div>

            {/* Step 2 */}
            <div className="ikram-step">
              <div className="ikram-step-number">02</div>
              <h3 className="ikram-step-title">You Reserve</h3>
              <p className="ikram-step-description">
                Browse available meals in your area and reserve through the app. 
                Pay a fraction of the original price.
              </p>
            </div>

            {/* Step 3 */}
            <div className="ikram-step">
              <div className="ikram-step-number">03</div>
              <h3 className="ikram-step-title">Pick Up & Enjoy</h3>
              <p className="ikram-step-description">
                Collect your meal during the pickup window. Enjoy premium dining 
                while reducing waste and saving money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartnerRestaurantsSection() {
  return (
    <section className="ikram-footer">
      <div className="ikram-footer-container">
        {/* Partner Restaurants */}
        <div className="ikram-partner-restaurants">
          <h2 className="ikram-partner-title">
            PARTNER RESTAURANTS
          </h2>
          <p className="ikram-partner-subtitle">
            Leading establishments committed to eliminating food waste
          </p>

          <div className="ikram-partner-cards">
            {partnerRestaurants.map((restaurant, index) => (
              <div key={index} className="ikram-partner-card">
                <div className="ikram-partner-card-header">
                  <div className="ikram-partner-name">
                    {restaurant.name}
                  </div>
                </div>
                <div className="ikram-partner-card-body">
                  <div className="ikram-partner-stat">
                    <span className="ikram-partner-stat-label">Food Rescued</span>
                    <span className="ikram-partner-stat-value">
                      {restaurant.saved}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
