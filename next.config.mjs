import withPWAInit from "next-pwa";

/** @type {import('next-pwa').PWAConfig} */
const withPWA = withPWAInit({
  dest: "public", // Каталог для сервис-воркера и других файлов PWA
  disable: process.env.NODE_ENV === "development", // Отключаем PWA в режиме разработки
  register: true, // Регистрировать сервис-воркер
  skipWaiting: true, // Устанавливать новый сервис-воркер немедленно
  // Дополнительные опции workbox можно добавить здесь
  // sw: 'service-worker.js', // Имя файла сервис-воркера
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Здесь могут быть другие ваши настройки Next.js
  reactStrictMode: true,
  // Явное указание обработки статических файлов
  assetPrefix: process.env.NODE_ENV === "production" ? undefined : undefined,
  // Настройки заголовков
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
