import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGoogleUser } from "@/lib/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Обрабатываем пользователя Google
      await handleGoogleUser({
        id: user.id,
        email: user.email!,
        user_metadata: user.user_metadata,
      });

      // Определяем URL для перенаправления в зависимости от окружения
      const redirectUrl =
        process.env.NODE_ENV === "development"
          ? `${requestUrl.origin}/`
          : "https://transport-accounting.vercel.app/";

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  const errorUrl =
    process.env.NODE_ENV === "development"
      ? `${requestUrl.origin}/error`
      : "https://transport-accounting.vercel.app/error";

  return NextResponse.redirect(errorUrl);
}
