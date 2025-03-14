import { Transport } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";

export const search = async (query: string): Promise<Transport[]> => {
  return (
    await axiosInstance.get<Transport[]>(ApiRoutes.SEARCH_PRODUCTS, {
      params: { query },
    })
  ).data;
};

export const allTransport = async (): Promise<Transport[]> => {
  return (await axiosInstance.get<Transport[]>(ApiRoutes.ALL_PRODUCTS)).data;
};

export const getTransport = async (id: number): Promise<Transport> => {
  return (await axiosInstance.get<Transport>(ApiRoutes.TRANSPORT + id)).data;
};

export const newTransport = async (values: {
  name: string;
  gosNumber: string;
  categoryId: number;
  statusId: number;
  generalKM: number;
}) => {
  return (await axiosInstance.post(ApiRoutes.NEW_TRANSPORT, values)).data;
};

export const deleteTransport = async (id: number) => {
  return (await axiosInstance.delete(ApiRoutes.TRANSPORT + id)).data;
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
  return (await axiosInstance.patch(ApiRoutes.TRANSPORT + id, values)).data;
};

export const updateStatusTransport = async (
  id: number,
  values: {
    statusId: number;
  }
) => {
  // const res = await (await axiosInstance.patch(ApiRoutes.TRANSPORT + id + "status", values)).data.headers["Content-Type"]
  return (
    await axiosInstance.patch(ApiRoutes.TRANSPORT + id + "/status", values)
  ).headers["Content-Type"];
};
