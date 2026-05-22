import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

export interface AuthContextType {
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
  debugUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const convertToUser = (sUser: SupabaseUser | null): User | null => {
    if (!sUser) return null;
    return {
      id: sUser.id,
      email: sUser.email ?? "",
      name:
        (sUser.user_metadata as any)?.name ??
        sUser.email?.split("@")[0] ??
        "User",
      createdAt: sUser.created_at ?? new Date().toISOString(),
    };
  };

  const debugUser = useCallback(() => {
    // Lightweight debug helper which is safe to call in non-browser environments
    if (typeof window === "undefined") return;
    // eslint-disable-next-line no-console
    console.group("Auth Debug");
    console.log("appUser:", user);
    console.log("supabaseUser:", supabaseUser);
    console.groupEnd();
  }, [user, supabaseUser]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (mounted && session?.user) {
          setSupabaseUser(session.user);
          setUser(convertToUser(session.user));
        }
      } catch (err) {
        // Don't crash app on session retrieval errors
        // eslint-disable-next-line no-console
        console.warn("Failed to get initial session:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const s = session.user;
        setSupabaseUser(s);
        setUser(convertToUser(s));
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      // Safely unsubscribe if available
      try {
        listener?.data?.subscription?.unsubscribe?.();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setSupabaseUser(data.user);
        setUser(convertToUser(data.user));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message ?? "Unknown error",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

        if (error) return { success: false, error: error.message };

        // After signup, Supabase may return a user object depending on settings.
        // We sign out to require email verification if that is the configured flow.
        if (data?.user) {
          await supabase.auth.signOut();
          setSupabaseUser(null);
          setUser(null);
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: (err as Error).message ?? "Unknown error",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSupabaseUser(null);
      setUser(null);
      setIsLoading(false);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
