import { Transport } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";
import { cacheService, withCache } from "./cache";

// Константы для тегов кеша
const CACHE_TAGS = {
  TRANSPORTS: "transports",
  TRANSPORT: (id: number) => `transport-${id}`,
};

// Оригинальные функции для работы с API
const _search = async (query: string): Promise<Transport[]> => {
  return (
    await axiosInstance.get<Transport[]>(ApiRoutes.SEARCH_PRODUCTS, {
      params: { query },
    })
  ).data;
};

const _allTransport = async (): Promise<Transport[]> => {
  return (await axiosInstance.get<Transport[]>(ApiRoutes.ALL_PRODUCTS)).data;
};

const _myTransports = async (): Promise<Transport[]> => {
  return (await axiosInstance.get<Transport[]>(ApiRoutes.MY_TRANSPORT)).data;
};

const _getTransport = async (id: number): Promise<Transport> => {
  return (await axiosInstance.get<Transport>(ApiRoutes.TRANSPORT + id)).data;
};

// Кешированные версии функций
export const search = withCache(
  _search,
  (query) => `transport-search-${query}`,
  { ttl: 30 * 1000, tags: [CACHE_TAGS.TRANSPORTS] }
);

export const allTransport = withCache(_allTransport, () => "transport-all", {
  ttl: 60 * 1000,
  tags: [CACHE_TAGS.TRANSPORTS],
});

export const myTransports = withCache(_myTransports, () => "transport-my", {
  ttl: 60 * 1000,
  tags: [CACHE_TAGS.TRANSPORTS],
});

export const getTransport = withCache(
  _getTransport,
  (id: number) => `transport-${id}`,
  {
    ttl: 2 * 60 * 1000,
    tags: [CACHE_TAGS.TRANSPORTS],
  }
);

// Мутирующие операции, которые должны инвалидировать кеш
export const newTransport = async (values: {
  userId: string;
  name: string;
  gosNumber: string;
  categoryId: number;
  statusId: number;
  generalKM: number;
}) => {
  const result = (await axiosInstance.post(ApiRoutes.NEW_TRANSPORT, values))
    .data;
  // Инвалидируем кеш после создания новой записи
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  return result;
};

export const deleteTransport = async (id: number) => {
  const result = (await axiosInstance.delete(ApiRoutes.TRANSPORT + id)).data;
  // Инвалидируем кеш после удаления записи
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORT(id));
  return result;
};

export const updateTransport = async (
  id: number,
  values: {
    name: string;
    gosNumber: string;
    categoryId: number;
    statusId: number;
    generalKM: number;
  }
) => {
  const result = (await axiosInstance.patch(ApiRoutes.TRANSPORT + id, values))
    .data;
  // Инвалидируем кеш после обновления записи
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORT(id));
  return result;
};

export const updateStatusTransport = async (
  id: number,
  values: {
    statusId: number;
  }
) => {
  // Инвалидируем кеш после обновления статуса
  const result = (
    await axiosInstance.patch(ApiRoutes.TRANSPORT + id + "/status", values)
  ).headers["Content-Type"];
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORT(id));
  return result;
};

// Обновление чека для ТО-1
export const updateTO1 = async (
  id: number,
  values: { nextTO1: number; isTO1Started: boolean }
) => {
  const result = (
    await axiosInstance.patch(ApiRoutes.TRANSPORT + id + "/updateTO1", values)
  ).data;
  // Инвалидируем кеш после обновления ТО-1
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORT(id));
  return result;
};

// Обновление чека для ТО-2
export const updateTO2 = async (
  id: number,
  values: { nextTO2: number; isTO2Started: boolean }
) => {
  const result = (
    await axiosInstance.patch(ApiRoutes.TRANSPORT + id + "/updateTO2", values)
  ).data;
  // Инвалидируем кеш после обновления ТО-2
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORTS);
  cacheService.invalidateByTag(CACHE_TAGS.TRANSPORT(id));
  return result;
};
