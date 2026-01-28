import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { User } from "../lib/helpers/types";
import { authHelpers } from "../lib/helpers/api";

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CACHE_KEY = "ikram_user_profile";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(() => {
    // Immediate Sync load: Try to get profile from localstorage on mount
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  // Use a ref to track the last fetched user ID to prevent redundant background fetches
  const lastFetchedId = useRef<string | null>(null);

  // Helper to update profile state and cache simultaneously
  const updateProfile = useCallback((profile: User | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(CACHE_KEY);
      lastFetchedId.current = null;
    }
  }, []);

  const fetchProfile = useCallback(
    async (userId: string, force = false) => {
      // Only fetch if it's a new user or we are forcing a refresh
      if (!force && lastFetchedId.current === userId) return;
      try {
        const { data, error } = await authHelpers.getUserProfile(userId);
        if (error) throw error;
        if (data) {
          lastFetchedId.current = userId;
          updateProfile(data);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    [updateProfile]
  );

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id, true);
  };

  useEffect(() => {
    // 1. Check for initial session once on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      if (event === "SIGNED_OUT") {
        setUser(null);
        updateProfile(null);
        setLoading(false);
        return;
      }

      if (currentUser) {
        setUser(currentUser);
        // Only trigger fetch on sign-in or initial load
        // This prevents re-fetching on every token refresh or scroll-induced re-render
        fetchProfile(currentUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, updateProfile]); // Removed userProfile from here!

  const signOut = async () => {
    try {
      // 1. Set loading true to prevent UI flickering
      setLoading(true);

      // 2. Call API
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 3. The onAuthStateChange will handle the state update ('SIGNED_OUT')
      // But also we will force it here for immediate UI response
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback: force clear state even if API failed
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
