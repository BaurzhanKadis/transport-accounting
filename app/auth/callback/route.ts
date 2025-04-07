import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  console.log(requestUrl.origin);

  try {
    const code = requestUrl.searchParams.get("code");
    // Получаем значение redirectTo из URL
    const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";

    if (code) {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && user) {
        // Проверяем существование пользователя
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email!,
          },
        });

        if (!existingUser) {
          // Создаем нового пользователя только если его нет
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              fullName:
                user.user_metadata.full_name || user.email!.split("@")[0],
              password: "", // Пустой пароль для Google пользователей
              role: "USER",
            },
          });
        }

        // Перенаправляем на страницу, указанную в redirectTo, или на главную страницу
        return NextResponse.redirect(
          redirectTo.startsWith("http")
            ? redirectTo
            : `${requestUrl.origin}${redirectTo}`
        );
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/error`);
  } catch (error) {
    console.error("Error in callback:", error);
    return NextResponse.redirect(`${requestUrl.origin}/error`);
  }
}
