import { ImageWithFallback } from "./fallback/ImageWithFallback";
type HeroSectionProps = {
  setCurrentPage: (page: string) => void;
  onScrollToImpact?: () => void;
};

export function HeroSection({
  setCurrentPage,
  onScrollToImpact,
}: HeroSectionProps) {
  const handleNavigation = () => {
    setCurrentPage("browse");
  };
  return (
    <section className="ikram-hero">
      {/* Background Pattern */}
      <div className="ikram-hero-bg-pattern" />

      <div className="ikram-hero-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Massive Text Content */}
          <div>
            <h1 className="ikram-hero-headline">
              RESCUE
              <span className="ikram-hero-headline-accent">TASTE</span>
            </h1>

            <p className="ikram-hero-subheadline">
              Premium food rescue platform connecting surplus meals with
              conscious consumers. Experience gourmet dining while fighting food
              waste.
            </p>

            <div className="ikram-hero-cta-group">
              <button
                onClick={handleNavigation}
                className="ikram-hero-cta ikram-hero-cta-primary"
              >
                Browse Meals
              </button>
              {/*TODO: handle on click here */}
              <button
                onClick={ onScrollToImpact }
                className="ikram-hero-cta ikram-hero-cta-secondary"
              >
                How It Works
              </button>
            </div>

            {/* Hero Stats */}
            <div className="ikram-hero-stats">
              <div className="ikram-hero-stat">
                <div className="ikram-hero-stat-value">250K+</div>
                <div className="ikram-hero-stat-label">Meals Rescued</div>
              </div>
              <div className="ikram-hero-stat">
                <div className="ikram-hero-stat-value">150+</div>
                <div className="ikram-hero-stat-label">Restaurants</div>
              </div>
              <div className="ikram-hero-stat">
                <div className="ikram-hero-stat-value">50K+</div>
                <div className="ikram-hero-stat-label">Happy Diners</div>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="relative h-[600px] rounded overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1762631884998-05cb22996fb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc3RlYWslMjBwbGF0ZWR8ZW58MXx8fHwxNzY0MTc3NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Gourmet rescued meal"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Floating Label on Image */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-[#000000] px-6 py-4 inline-block">
                <div className="text-[#C88D00] font-bold text-sm tracking-widest uppercase mb-1">
                  Premium Quality
                </div>
                <div className="text-white text-lg">
                  Restaurant-quality meals at rescued prices
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
