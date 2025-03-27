"use client";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  email: string;
  metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  createdAt: string;
  lastSignIn: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Пользователь не найден</div>
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
            <p className="text-gray-600">{userData.id}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>

          {userData.metadata.full_name && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Имя</h2>
              <p className="text-gray-600">{userData.metadata.full_name}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Дата регистрации
            </h2>
            <p className="text-gray-600">
              {new Date(userData.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Последний вход
            </h2>
            <p className="text-gray-600">
              {new Date(userData.lastSignIn).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
