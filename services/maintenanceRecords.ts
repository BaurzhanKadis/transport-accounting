import { MaintenanceRecord, MaintenanceType } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";

export const getByTransportId = async (
  transportId: number
): Promise<MaintenanceRecord[]> => {
  return (
    await axiosInstance.get<MaintenanceRecord[]>(
      ApiRoutes.MAINTENANCE_RECORDS + transportId
    )
  ).data;
};

export const createMaintenanceRecord = async (data: {
  transportId: number;
  type: MaintenanceType;
  description?: string;
  cost?: number;
  mileage: number;
}): Promise<MaintenanceRecord> => {
  return (
    await axiosInstance.post<MaintenanceRecord>(
      ApiRoutes.MAINTENANCE_RECORDS,
      data
    )
  ).data;
};

export const getAllMaintenanceRecords = async (): Promise<
  MaintenanceRecord[]
> => {
  return (
    await axiosInstance.get<MaintenanceRecord[]>(ApiRoutes.MAINTENANCE_RECORDS)
  ).data;
};
