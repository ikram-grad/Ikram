import { useState } from "react";
import { User, LogOut, Menu, X, LayoutDashboard, Package } from "lucide-react";
import { useAuth } from "../context/authContext";

interface NavigationProps {
  onNavigate?: (page: string) => void;
  onAuthClick?: () => void;
  currentPage?: string;
}

// 1. Define the interface for NavLink's props
interface NavLinkProps {
  page: string;
  label: string;
  currentPage: string;
  onNavigate?: (page: string) => void;
}

// 2. MOVED OUTSIDE: NavLink is now a stable component
const NavLink = ({ page, label, currentPage, onNavigate }: NavLinkProps) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate?.(page)}
      className={`relative text-sm tracking-[0.2em] uppercase transition-all duration-300 ${
        isActive ? "text-[#C88D00]" : "text-white/90 hover:text-white"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#C88D00]" />
      )}
    </button>
  );
};

export function Navigation({
  onNavigate,
  onAuthClick,
  currentPage = "home",
}: NavigationProps) {
  const { user, userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    if (onNavigate) onNavigate("home");
  };

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user || !userProfile) return [];

    switch (userProfile.role) {
      case "consumer":
        return [
          { page: "home", label: "Home" },
          { page: "browse", label: "Browse" },
          { page: "impact", label: "Impact" },
        ];
      case "restaurant":
        return [
          { page: "restaurant-dashboard", label: "Restaurant Dashboard" },
          { page: "restaurant-orders", label: "Orders" },
        ];
      case "charity":
        return [
          { page: "home", label: "Home" },
          { page: "donations", label: "Donations" },
        ];
      case "admin":
        return [
          { page: "admin-dashboard", label: "Admin Dashboard" },
          { page: "admin-users", label: "Users" },
          { page: "admin-meals", label: "Meals" },
          { page: "admin-orders", label: "Orders" },
        ];
      default:
        return [
          { page: "home", label: "Home" },
          { page: "browse", label: "Browse" },
          { page: "impact", label: "Impact" },
          { page: 'reset-password', label: "RESET PASSWORD"}
        ];
    }
  };

  // Get user menu items based on role
  const getUserMenuItems = () => {
    if (!user || !userProfile) return [];
    
    switch (userProfile.role) {
      case "consumer":
        return [
          { page: "profile", label: "My Impact", icon: User },
          { page: "orders", label: "Orders", icon: Package },
        ];
      case "restaurant":
        return [{ page: "restaurant-profile", label: "Profile", icon: User }];
      case "charity":
        return [{ page: "charity-profile", label: "Profile", icon: User }];
      case "admin":
        return [{ page: "admin-settings", label: "Settings", icon: User }];
      default:
        return [{ page: "profile", label: "Profile", icon: User }];
    }
  };

  const navItems = user
    ? getNavItems()
    : [
        { page: "home", label: "Home" },
        { page: "browse", label: "Browse" },
        { page: "impact", label: "Impact" },
      ];

  const userMenuItems = getUserMenuItems();

  return (
    <>
      <nav className="bg-[#1A1A1A] px-6 md:px-16 py-5 sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-[2000px] mx-auto flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => onNavigate?.("home")}
            className="text-2xl md:text-3xl tracking-[-0.02em] text-[#C88D00] hover:opacity-80 transition-opacity"
          >
            IKRAM
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              // 3. UPDATED: Pass currentPage and onNavigate explicitly
              <NavLink 
                key={item.page} 
                page={item.page} 
                label={item.label}
                currentPage={currentPage}
                onNavigate={onNavigate}
              />
            ))}

            {user ? (
              <div className="hidden md:flex items-center gap-8 ml-6 pl-6 border-l border-white/10">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.page}
                      onClick={() => onNavigate?.(item.page)}
                      className={`flex items-center gap-2 text-sm transition-colors tracking-wide ${
                        currentPage === item.page
                          ? "text-[#C88D00]"
                          : "text-white/70 hover:text-[#C88D00]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-[#C88D00] transition-colors tracking-wide"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="ml-6 px-8 py-2.5 bg-[#C88D00] text-black text-xs tracking-[0.2em] uppercase hover:bg-[#B07D00] transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#C88D00] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-[73px] left-0 right-0 bg-[#1A1A1A]/95 border-b border-white/5 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8">
              {/* Navigation Links */}
              <div className="space-y-6 pb-8 border-b border-white/10">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate?.(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`block text-xl tracking-[0.15em] uppercase transition-colors ${
                      currentPage === item.page
                        ? "text-[#C88D00]"
                        : "text-white hover:text-[#C88D00]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* User Section */}
              {user ? (
                <div className="pt-8 space-y-6">
                  {userProfile && (
                    <div className="pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-1">
                        <User className="w-5 h-5 text-[#C88D00]" />
                        <span className="text-white/90">
                          {userProfile.name}
                        </span>
                      </div>
                      <div className="text-xs text-white/40 tracking-[0.15em] uppercase ml-8">
                        {userProfile.role === "restaurant" && "Restaurant Partner"}
                        {userProfile.role === "charity" && "Charity Partner"}
                        {userProfile.role === "admin" && "Administrator"}
                        {userProfile.role === "consumer" && "Member"}
                      </div>
                    </div>
                  )}

                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.page}
                        onClick={() => {
                          onNavigate?.(item.page);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 text-lg tracking-[0.15em] uppercase transition-colors ${
                          currentPage === item.page
                            ? "text-[#C88D00]"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-lg text-white/70 hover:text-[#C88D00] tracking-[0.15em] uppercase transition-colors pt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <div className="pt-8">
                  <button
                    onClick={() => {
                      onAuthClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 bg-[#C88D00] text-black text-sm tracking-[0.2em] uppercase hover:bg-[#B07D00] transition-all"
                  >
                    SIGN IN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}