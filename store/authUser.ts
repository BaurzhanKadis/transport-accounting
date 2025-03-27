import { supabase } from "@/lib/supabase/config";
import { User } from "@prisma/client";
import { create } from "zustand";

const useAuthStore = create<{
  user: User | null;
  error: Error | null;
  fetchUser: () => Promise<void>;
}>((set) => ({
  user: null,
  error: null,
  fetchUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      const user: User = {
        id: data.user.id,
        fullName: data.user.user_metadata?.full_name || "",
        email: data.user.email || "",
        password: "",
        role: "USER",
        createdAt: new Date(data.user.created_at),
        updateAt: new Date(),
      };
      set({ user, error: null });
    } else {
      set({ user: null, error });
    }
  },
}));

export default useAuthStore;
