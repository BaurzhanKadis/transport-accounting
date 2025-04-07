import { Category } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";
import { withCache } from "./cache";

// Константы для тегов кеша
const CACHE_TAGS = {
  CATEGORIES: "categories",
};

// Оригинальная функция для получения категорий
const _categoryes = async (): Promise<Category[]> => {
  return (await axiosInstance.get<Category[]>(ApiRoutes.CATEGORYES)).data;
};

// Кешированная версия функции
export const categoryes = withCache(
  _categoryes,
  () => "categories-all",
  { ttl: 5 * 60 * 1000, tags: [CACHE_TAGS.CATEGORIES] } // Кешируем на 5 минут
);
