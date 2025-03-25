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

      return NextResponse.redirect(requestUrl.origin);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/error`);
}
