import { useEffect, useRef, useState } from "react";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { MasonryContent } from "./components/MasonryContent";
import {
  ImpactSection,
  PartnerRestaurantsSection,
} from "./components/ImpactSection";
import { AuthProvider, useAuth } from "./context/authContext"; // Ensure useAuth is exported from here
import { OrdersPage } from "./components/OrdersPage";
import { AuthModal } from "./components/AuthModal";
import { ImpactProfile } from "./components/ImpactProfile";
import { BrowsePage } from "./components/BrowsePage";
import { Footer } from "./components/FooterSection";

import { AdminDashboard } from "./components/admin/AdminDashboard";
import { CharityDashboard } from "./components/charity/CharityDashboard";
import { RestaurantDashboard } from "./components/restaurant/RestaurantDashboard";
import { RestaurantOrders } from "./components/restaurant/RestaurantOrders";
import { RestaurantProfile } from "./components/restaurant/RestaurantProfile";
import { CharityProfile } from "./components/charity/CharityProfile";
import { AdminUsers } from "./components/admin/AdminUsers";
import { LoadingContainer } from "./components/ui/loading";
import { CTASection } from "./components/CTASection";
import { ResetPassword } from "./components/ResetPassword";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle scrolling to mansoryContent
  const impactRef = useRef<HTMLDivElement | null>(null);
  // 3. Get the user profile to check roles
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (window.location.pathname === "/reset-password-bridge") {
      const { search, hash } = window.location;
      window.location.replace(`/#/reset-password${search}${hash}`);
    }
  }, []);

  // Hash Router implementation (Kept exactly as you had it)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "") || "home";
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (page: string) => {
    window.location.hash = `/${page}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Update Auth Success to redirect based on role
  const handleAuthSuccess = () => {
    setShowAuthModal(false);

    console.log(userProfile);
    if (userProfile?.role === "admin") {
      handleNavigate("admin-dashboard");
    } else if (userProfile?.role === "restaurant") {
      // Optional: Add restaurant redirect here later
      // handleNavigate('meals');
    }
  };

  const renderPage = () => {
    // 5. Handle Admin Dashboard
    if (currentPage === "admin-dashboard") {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }

    if (currentPage === "admin-users") {
      return <AdminUsers onNavigate={handleNavigate} />;
    }

    // 6. Handle Admin Sub-pages (Placeholders so dashboard links work)
    if (
      ["admin-meals", "admin-orders", "admin-settings"].includes(currentPage)
    ) {
      return (
        <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-4xl tracking-tighter text-[#1A1A1A] mb-4">
              {currentPage.replace("admin-", "").toUpperCase()}
            </h2>
            <p className="text-neutral-600 mb-8">
              This admin module is under construction
            </p>
            <button
              onClick={() => handleNavigate("admin-dashboard")}
              className="px-8 py-3 bg-[#C88D00] text-black text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (currentPage === "restaurant-profile") {
      return <RestaurantProfile onNavigate={handleNavigate} />;
    }

    if (currentPage === "charity-profile") {
      return <CharityProfile onNavigate={handleNavigate} />;
    }

    if (currentPage === "restaurant-dashboard") {
      return <RestaurantDashboard onNavigate={handleNavigate} />;
    }

    if (currentPage === "restaurant-orders") {
      return <RestaurantOrders onNavigate={handleNavigate} />;
    }

    if (currentPage === "donations") {
      return <CharityDashboard onNavigate={handleNavigate} />;
    }

    // 7. Your Original Page Logic
    switch (currentPage) {
      case "orders":
        return <OrdersPage />;
      case "profile":
        return <ImpactProfile />;
      case "browse":
        return (
          <>
            <BrowsePage />
            <Footer />
          </>
        );
      case "impact":
        return (
          <>
            <ImpactSection />
            <PartnerRestaurantsSection />
            <CTASection
              onAuthClick={() => {
                setShowAuthModal(true);
              }}
            />
            <Footer />
          </>
        );
      case "reset-password":
        return <ResetPassword />;
      case "home":
      default:
        return (
          <>
            <HeroSection
              setCurrentPage={handleNavigate}
              onScrollToImpact={() =>
                impactRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            />
            <BrowsePage />
            <MasonryContent setCurrentPage={handleNavigate} />
            <div ref={impactRef}>
              <ImpactSection />
            </div>
            <Footer />
          </>
        );
    }
  };

  if (loading) {
    return LoadingContainer();
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAuthClick={() => setShowAuthModal(true)}
      />
      <main>{renderPage()}</main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
