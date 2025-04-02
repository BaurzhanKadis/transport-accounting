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
};

export default withPWA(nextConfig);
