import { Transport } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";

export const getByTransportId = async (
  transportId: number
): Promise<Transport> => {
  return (
    await axiosInstance.get<Transport>(
      ApiRoutes.MAINTENANCE_RECORDS + transportId
    )
  ).data;
};
