import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Пути, доступные без авторизации
const PUBLIC_PATHS = [
  "/login", // Страница входа
  "/auth", // Пути для обработки аутентификации
  "/api/auth", // API эндпоинты для аутентификации
  // "/", // Главная страница (удалена, теперь требует авторизации)
];

// Пути, всегда разрешенные для всех (статические файлы, иконки, etc.)
const ALWAYS_ALLOWED_PATHS = ["/_next", "/favicon.ico", "/icons", "/images"];

// Проверяет, является ли путь публичным
function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    ALWAYS_ALLOWED_PATHS.some((path) => pathname.startsWith(path))
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Текущий путь
  const { pathname } = request.nextUrl;

  // Если пользователь не авторизован и путь не является публичным
  if (!user && !isPublicPath(pathname)) {
    console.log(`Unauthorized access to ${pathname}, redirecting to login`);

    // Клонируем URL для редиректа
    const url = request.nextUrl.clone();
    url.pathname = "/login";

    // Сохраняем исходный URL как параметр запроса для редиректа после входа
    // Не перезаписываем существующий redirectTo, если он уже есть
    if (!url.searchParams.has("redirectTo") && pathname !== "/") {
      url.searchParams.set("redirectTo", pathname);
    } else if (pathname === "/") {
      // Если пытались получить доступ к главной странице, перенаправим туда же после входа
      url.searchParams.set("redirectTo", "/");
    }

    // Перенаправляем на страницу входа
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
