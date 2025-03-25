import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

interface GoogleUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

export async function handleGoogleUser(user: GoogleUser): Promise<User | null> {
  try {
    // Проверяем, существует ли пользователь в таблице User
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) {
      // Создаем нового пользователя
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || user.email.split("@")[0],
          password: "", // Пустой пароль для Google пользователей
          role: "USER",
        },
      });
    }

    return existingUser || null;
  } catch (error) {
    console.error("Error handling Google user:", error);
    throw error;
  }
}
