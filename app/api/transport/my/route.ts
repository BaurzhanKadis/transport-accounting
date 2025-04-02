import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // Используем серверный клиент Supabase
import { prisma } from "@/prisma/prisma-client"; // Исправленный путь к Prisma

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Проверка аутентификации пользователя
  if (authError || !user) {
    console.error("Authentication error:", authError);
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    // Получаем транспортные средства, принадлежащие текущему пользователю
    const transports = await prisma.transport.findMany({
      where: {
        userId: user.id, // Фильтруем по ID пользователя
      },
      include: {
        // Включаем связанные данные, если они нужны на фронтенде
        category: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc", // Сортируем по дате создания (опционально)
      },
    });

    return NextResponse.json(transports, { status: 200 });
  } catch (error) {
    console.error("Error fetching user transports:", error);
    // Ошибка сервера при запросе к базе данных
    return NextResponse.json(
      { error: "Ошибка получения транспортных средств" },
      { status: 500 }
    );
  }
}
