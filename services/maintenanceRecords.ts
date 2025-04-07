import { MaintenanceRecord, MaintenanceType } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";
import { cacheService, withCache } from "./cache";

// Константы для тегов кеша
const CACHE_TAGS = {
  MAINTENANCE: "maintenance",
  TRANSPORT_MAINTENANCE: (transportId: number) =>
    `transport-maintenance-${transportId}`,
};

// Оригинальные функции для работы с API
const _getByTransportId = async (
  transportId: number
): Promise<MaintenanceRecord[]> => {
  return (
    await axiosInstance.get<MaintenanceRecord[]>(
      ApiRoutes.MAINTENANCE_RECORDS + transportId
    )
  ).data;
};

const _getAllMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  return (
    await axiosInstance.get<MaintenanceRecord[]>(ApiRoutes.MAINTENANCE_RECORDS)
  ).data;
};

// Кешированные версии функций
export const getByTransportId = withCache(
  _getByTransportId,
  (transportId: number) => `maintenance-transport-${transportId}`,
  {
    ttl: 2 * 60 * 1000,
    tags: [CACHE_TAGS.MAINTENANCE, CACHE_TAGS.TRANSPORT_MAINTENANCE(0)], // Тег будет заменен при вызове
  }
);

export const getAllMaintenanceRecords = withCache(
  _getAllMaintenanceRecords,
  () => "maintenance-all",
  { ttl: 2 * 60 * 1000, tags: [CACHE_TAGS.MAINTENANCE] }
);

// Мутирующая операция, которая должна инвалидировать кеш
export const createMaintenanceRecord = async (data: {
  transportId: number;
  type: MaintenanceType;
  description?: string;
  cost?: number;
  mileage: number;
}): Promise<MaintenanceRecord> => {
  const result = (
    await axiosInstance.post<MaintenanceRecord>(
      ApiRoutes.MAINTENANCE_RECORDS,
      data
    )
  ).data;

  // Инвалидируем кеш после создания новой записи
  cacheService.invalidateByTag(CACHE_TAGS.MAINTENANCE);
  cacheService.invalidateByTag(
    CACHE_TAGS.TRANSPORT_MAINTENANCE(data.transportId)
  );

  return result;
};
