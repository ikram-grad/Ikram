import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ImageWithFallback } from "./fallback/ImageWithFallback";

const contentItems = [
  {
    id: 1,
    type: "feature",
    label: "SURPLUS",
    title: "Quality ingredients saved from waste",
    description:
      "Premium dishes rescued from top restaurants at 50% off. Fresh, delicious, and sustainable.",
    image:
      "https://images.unsplash.com/photo-1634731201932-9bd92839bea2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBwcm9kdWNlfGVufDF8fHx8MTc2NDA1ODMwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    accent: "gold",
  },
  {
    id: 2,
    type: "stat",
    stat: "250K+",
    label: "Meals Rescued",
    description: "Join thousands making a difference",
  },
  {
    id: 3,
    type: "feature",
    label: "PREMIUM",
    title: "Restaurant quality, rescued prices",
    description:
      "Experience fine dining at a fraction of the cost. Same quality, zero waste.",
    image:
      "https://images.unsplash.com/photo-1759146048842-743b12d9dfa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwbWVhbCUyMHBsYXRlZHxlbnwxfHx8fDE3NjQxMzkxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    accent: "gold",
  },
  {
    id: 4,
    type: "feature",
    label: "IMPACT",
    title: "Every meal rescued makes a difference",
    description:
      "Your purchase saves food from landfills and supports local restaurants.",
    image:
      "https://images.unsplash.com/photo-1699581913577-cc877cdae36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwZm9vZCUyMGluZ3JlZGllbnRzfGVufDF8fHx8MTc2NDE3NzU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 5,
    type: "stat",
    stat: "150+",
    label: "Partner Restaurants",
    description: "Premium dining partners",
  },
  {
    id: 6,
    type: "feature",
    label: "ARTISAN",
    title: "Crafted with care, saved from waste",
    description:
      "Handcrafted meals from award-winning chefs, available at rescued prices.",
    image:
      "https://images.unsplash.com/photo-1627308593341-d886acdc06a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYnJlYWQlMjBiYWtlcnl8ZW58MXx8fHwxNzY0MTQwODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    accent: "gold",
  },
  {
    id: 7,
    type: "quote",
    text: "Eat well, waste nothing. Join the movement towards conscious dining.",
    author: "— Ikram Team",
  },
  {
    id: 8,
    type: "feature",
    label: "FRESH",
    title: "Today's surplus, tomorrow's savings",
    description:
      "Daily rotating menu of premium meals. Reserve now, pick up today.",
    image:
      "https://images.unsplash.com/photo-1737837479225-7af10798403b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGxhdGUlMjBjdXRvdXR8ZW58MXx8fHwxNzY0MTc3NTYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function MasonryContent({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) {
  return (
    <section className="ikram-masonry">
      <div className="ikram-masonry-container">
        {/* Section Header */}
        <div className="ikram-masonry-header">
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-2 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold tracking-widest uppercase rounded mb-4">
              Why Choose Ikram
            </span>
          </div>
          <h2 className="ikram-masonry-title">EXPERIENCE THE DIFFERENCE</h2>
          <p className="ikram-masonry-subtitle">
            A new approach to premium dining that values quality over waste.
            Discover how we're revolutionizing the food industry, one rescued
            meal at a time.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="ikram-masonry-grid">
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 3 }}
          >
            <Masonry gutter="1.5rem">
              {contentItems.map((item) => {
                // Feature Card with Image
                if (item.type === "feature") {
                  return (
                    <div key={item.id} className="ikram-masonry-item">
                      <div className="relative overflow-hidden">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="ikram-masonry-image w-full h-[350px] object-cover"
                        />
                        <div className="ikram-masonry-overlay">
                          <div
                            className={`ikram-masonry-label ${item.accent || ""}`}
                          >
                            {item.label}
                          </div>
                          <h3 className="text-white text-xl font-bold mb-2 leading-tight">
                            {item.title}
                          </h3>
                          <p className="ikram-masonry-description">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Stat Card
                if (item.type === "stat") {
                  return (
                    <div key={item.id} className="ikram-masonry-card w-full">
                      <div className="text-center py-10">
                        <div
                          className="text-3xl md:text-7xl font-black text-[var(--orange)] mb-4"
                          style={{
                            fontFamily: "Oswald, Impact, sans-serif",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {item.stat}
                        </div>
                        <div className="ikram-masonry-card-title text-base mb-2">
                          {item.label}
                        </div>
                        <div className="ikram-masonry-card-text">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Quote Card
                if (item.type === "quote") {
                  return (
                    <div
                      key={item.id}
                      className="ikram-masonry-card bg-[var(--black)] border-[var(--orange)]"
                    >
                      <div className="py-8 px-6">
                        <svg
                          className="w-12 h-12 text-[var(--orange)] mb-4 opacity-50"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p
                          className="text-[var(--color-charcoal)] text-xl md:text-2xl font-medium leading-relaxed mb-4"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.text}
                        </p>
                        <p className="text-[var(--orange)] text-sm font-semibold tracking-wider">
                          {item.author}
                        </p>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </Masonry>
          </ResponsiveMasonry>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button 
          onClick={() => {
            setCurrentPage("browse");
          }}
          className="ikram-hero-cta ikram-hero-cta-primary inline-block">
            Start Rescuing Meals
          </button>
          <p className="mt-4 text-sm text-[var(--black)]/60">
            Join 50,000+ conscious diners making a difference
          </p>
        </div>
      </div>
    </section>
  );
}
