"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authUser";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user, fetchUser, isLoading, error } = useAuthStore();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsPageLoading(true);

      try {
        // Проверяем текущую сессию напрямую
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        console.log("ProfilePage: Checking session", {
          hasSession: !!data.session,
          sessionExpires: data.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
        });

        if (!data.session) {
          console.log("ProfilePage: No session found, redirecting");
          toast.error("Сессия не найдена. Пожалуйста, войдите в систему.");
          // Даем toast время на отображение
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }

        // Принудительно запрашиваем данные пользователя
        console.log("ProfilePage: Fetching user data");
        const userData = await fetchUser();
        console.log("ProfilePage: User data fetched", { found: !!userData });

        if (!userData) {
          console.error(
            "ProfilePage: User data not found despite valid session"
          );
          toast.error("Не удалось загрузить данные пользователя");
        }
      } catch (err) {
        console.error("ProfilePage: Error loading user data", err);
        toast.error(
          `Ошибка загрузки данных: ${
            err instanceof Error ? err.message : "Неизвестная ошибка"
          }`
        );
      } finally {
        setIsPageLoading(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPageLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Ошибка: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">
          Пользователь не найден. Пожалуйста,{" "}
          <a href="/login" className="text-blue-500 underline">
            войдите в систему
          </a>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">ID</h2>
            <p className="text-gray-600">{user.id}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {user.fullName && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Имя</h2>
              <p className="text-gray-600">{user.fullName}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Дата регистрации
            </h2>
            <p className="text-gray-600">{user.createdAt.toLocaleString()}</p>
          </div>

          {user.lastSignIn && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Последний вход
              </h2>
              <p className="text-gray-600">
                {user.lastSignIn.toLocaleString()}
              </p>
            </div>
          )}

          {user.avatarUrl && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Аватар</h2>
              <img
                src={user.avatarUrl}
                alt="Аватар пользователя"
                className="w-24 h-24 rounded-full mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
