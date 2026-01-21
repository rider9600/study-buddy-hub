import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  debugUser: () => void; // Debug function to check user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our User type
  const convertToUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name:
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  });

  // Debug function to log user information
  const debugUser = useCallback(() => {
    console.group("🔍 User Debug Information");
    console.log("Current User (App):", user);
    console.log("Supabase User (Raw):", supabaseUser);
    console.log("Is Authenticated:", !!user);
    console.log("User ID:", user?.id);
    console.log("Email:", user?.email);
    console.log("Name:", user?.name);
    console.groupEnd();
  }, [user, supabaseUser]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(convertToUser(session.user));
        console.log("✅ Initial session found:", session.user.email);
      } else {
        console.log("ℹ️ No initial session found");
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event);

      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(convertToUser(session.user));
        console.log("✅ User logged in:", session.user.email);
      } else {
        setSupabaseUser(null);
        setUser(null);
        console.log("👋 User logged out");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);
        console.log("🔐 Attempting login for:", email);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("❌ Login failed:", error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setSupabaseUser(data.user);
          setUser(convertToUser(data.user));
          console.log("✅ Login successful:", data.user.email);
        }

        return { success: true };
      } catch (error) {
        console.error("❌ Login error:", error);
        return { success: false, error: "An unexpected error occurred" };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);
        console.log("📝 Attempting signup for:", email);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (error) {
          console.error("❌ Signup failed:", error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          console.log("✅ Signup successful:", data.user.email);
          console.log("📧 Check email for verification");

          // Sign out immediately to require email verification before login
          await supabase.auth.signOut();
          setSupabaseUser(null);
          setUser(null);
        }

        return { success: true };
      } catch (error) {
        console.error("❌ Signup error:", error);
        return { success: false, error: "An unexpected error occurred" };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      console.log("👋 Logging out user");
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        debugUser,
      }}
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
