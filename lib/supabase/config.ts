import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey.substring(0, 10) + "...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window !== "undefined") {
          const value = window.localStorage.getItem(key);
          console.log(
            `Getting ${key} from storage:`,
            value ? "present" : "missing"
          );
          return value;
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== "undefined") {
          console.log(
            `Setting ${key} in storage:`,
            value ? "present" : "missing"
          );
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== "undefined") {
          console.log(`Removing ${key} from storage`);
          window.localStorage.removeItem(key);
        }
      },
    },
    flowType: "pkce",
    debug: true,
  },
  global: {
    headers: {
      "x-application-name": "transport-accounting",
    },
  },
});
