import { Status } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";

export const allStatus = async (): Promise<Status[]> => {
  return (await axiosInstance.get<Status[]>(ApiRoutes.STATUS)).data;
};
