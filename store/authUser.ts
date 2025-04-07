import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";

export interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastSignIn?: Date;
  avatarUrl?: string;
}

interface AuthState {
  user: UserData | null;
  error: Error | null;
  isLoading: boolean;
  isInitialized: boolean;
  fetchUser: () => Promise<UserData | null>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<UserData>) => void;
  resetError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  error: null,
  isLoading: false,
  isInitialized: false,

  fetchUser: async () => {
    try {
      console.log("AuthStore: fetchUser started");
      set({ isLoading: true });
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("AuthStore: Error getting user:", error);
        set({ error, user: null, isLoading: false, isInitialized: true });
        return null;
      }

      if (data?.user) {
        console.log("AuthStore: User data received:", data.user.email);

        const userData: UserData = {
          id: data.user.id,
          email: data.user.email || "",
          fullName:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "",
          role: data.user.user_metadata?.role || "USER",
          metadata: data.user.user_metadata || {},
          createdAt: new Date(data.user.created_at),
          lastSignIn: data.user.last_sign_in_at
            ? new Date(data.user.last_sign_in_at)
            : undefined,
          avatarUrl: data.user.user_metadata?.avatar_url,
        };

        console.log("AuthStore: User data processed:", userData.email);
        set({
          user: userData,
          error: null,
          isLoading: false,
          isInitialized: true,
        });
        return userData;
      } else {
        console.log("AuthStore: No user found");
        set({ user: null, error: null, isLoading: false, isInitialized: true });
        return null;
      }
    } catch (err) {
      console.error("AuthStore: Unexpected error in fetchUser:", err);
      const error =
        err instanceof Error
          ? err
          : new Error("Unknown error during authentication");
      set({ error, user: null, isLoading: false, isInitialized: true });
      return null;
    }
  },

  logout: async () => {
    try {
      console.log("AuthStore: logout started");
      set({ isLoading: true });
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("AuthStore: Error signing out:", error);
        set({ error, isLoading: false });
        return;
      }

      console.log("AuthStore: logout successful");
      set({ user: null, error: null, isLoading: false });
    } catch (err) {
      console.error("AuthStore: Unexpected error in logout:", err);
      const error =
        err instanceof Error ? err : new Error("Unknown error during logout");
      set({ error, isLoading: false });
    }
  },

  updateUserData: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      console.log("AuthStore: Updating user data");
      set({ user: { ...currentUser, ...userData } });
    } else {
      console.warn("AuthStore: Cannot update user data, no user logged in");
    }
  },

  resetError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
