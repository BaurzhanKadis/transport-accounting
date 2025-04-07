import { Status } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";
import { withCache } from "./cache";

// Константы для тегов кеша
const CACHE_TAGS = {
  STATUSES: "statuses",
};

// Оригинальная функция для получения статусов
const _allStatus = async (): Promise<Status[]> => {
  return (await axiosInstance.get<Status[]>(ApiRoutes.STATUS)).data;
};

// Кешированная версия функции
export const allStatus = withCache(
  _allStatus,
  () => "statuses-all",
  { ttl: 5 * 60 * 1000, tags: [CACHE_TAGS.STATUSES] } // Кешируем на 5 минут
);
