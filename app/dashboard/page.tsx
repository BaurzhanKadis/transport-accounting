"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/config";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          toast.error("Ошибка авторизации");
          router.push("/login");
          return;
        }

        if (!session) {
          console.log("No active session");
          router.push("/login");
          return;
        }

        // Подробное логирование токена
        console.log("Access Token:", session.access_token);
        console.log("Refresh Token:", session.refresh_token);
        console.log(
          "Expires At:",
          new Date(session.expires_at! * 1000).toLocaleString()
        );
        console.log("Token Type:", session.token_type);
        console.log("Full Session:", JSON.stringify(session, null, 2));

        // Проверяем, что токен действителен
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User error:", userError);
          toast.error("Ошибка получения данных пользователя");
          router.push("/login");
          return;
        }

        console.log("User data:", user);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Произошла ошибка");
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Панель управления
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Здесь будет содержимое панели управления */}
          </div>
        </main>
      </div>
    </div>
  );
}
