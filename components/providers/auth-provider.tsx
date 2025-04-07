"use client";

import { createClient } from "@/lib/supabase/client";
import useAuthStore from "@/store/authUser";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Функция для инициализации аутентификации
    const initAuth = async () => {
      console.log("AuthProvider: initializing auth", {
        isInitialized,
        isLoading,
      });

      try {
        // Создаем Supabase клиент
        const supabase = createClient();

        // Получаем текущую сессию
        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = !!sessionData.session;

        console.log("AuthProvider: session check", {
          hasSession,
          sessionExists: !!sessionData.session,
        });

        // Если есть активная сессия или еще не инициализировано, загружаем данные пользователя
        if (hasSession || !isInitialized) {
          console.log("AuthProvider: fetching user data");
          const userData = await fetchUser();
          console.log(
            "AuthProvider: user data fetched",
            userData ? "User found" : "No user"
          );
        }

        // Добавляем слушатель для отслеживания изменений в аутентификации
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth event:", event, { hasSession: !!session });

          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("AuthProvider: signed in, updating user data");
            await fetchUser();
          } else if (event === "SIGNED_OUT") {
            console.log("AuthProvider: signed out, clearing user data");
            // При выходе пользователя очищаем данные
            useAuthStore.setState({
              user: null,
              error: null,
              isInitialized: true,
              isLoading: false,
            });
          }
        });

        // Функция очистки подписки при размонтировании компонента
        return () => {
          console.log("AuthProvider: cleaning up subscription");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("AuthProvider: Error initializing auth:", error);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Убираем зависимости для предотвращения бесконечных циклов

  return <>{children}</>;
}
