"use client";
import { Api } from "@/services/api-client";
import React, { useEffect } from "react";
import { useDebounce } from "react-use";
import { Category, MaintenanceRecord, Status, Transport } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CirclePlus, Eye, SquarePen } from "lucide-react";
import { AlertDialogDemo } from "@/components/shared/alert";
import { CRITICAL_DISTANCE } from "@/services/constants";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAuthStore from "@/store/authUser";

export default function TransportPage() {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [allStatuses, setAllStatuses] = React.useState<Status[]>([]);
  const [allMaintenanceRecords, setAllMaintenanceRecords] = React.useState<
    MaintenanceRecord[]
  >([]);
  // const { user } = useAuthStore();
  // console.log(user);
  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const categories = await Api.categoryes.categoryes();
        const statuses = await Api.status.allStatus();
        const maintenanceRecords =
          await Api.maintenanceRecords.getAllMaintenanceRecords();
        setAllTransports(response);
        setAllCategories(categories);
        setAllStatuses(statuses);
        setAllMaintenanceRecords(maintenanceRecords);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
  );
  const { user } = useAuthStore();

  useEffect(() => {
    console.log(user);
  }, [user]);

  const deleteItem = async (id: number) => {
    try {
      const response = await Api.transports.deleteTransport(id);
      setAllTransports(response);
    } catch (error) {
      console.log(error);
    }
  };

  const formatKM = (km: number | null) => {
    return km ? km.toLocaleString("ru-RU") : "0";
  };

  // Функция для получения последней записи ТО-2 для транспорта
  const getLastTO2Record = (transportId: number) => {
    return allMaintenanceRecords
      .filter(
        (record) => record.transportId === transportId && record.type === "TO2"
      )
      .sort((a, b) => b.mileage - a.mileage)[0];
  };

  // Функция для расчета следующего ТО-2
  const calculateNextTO2 = (
    transportId: number,
    currentKM: number | null,
    interval: number | null
  ): string => {
    if (!currentKM || !interval) return "ТО2 не пройдено";

    const lastTO2 = getLastTO2Record(transportId);
    if (!lastTO2) {
      return "ТО2 не пройдено";
    }

    const nextTO2Point = lastTO2.mileage + interval;
    const remaining = nextTO2Point - currentKM;

    if (remaining <= 0) {
      return `Просрочено на ${formatKM(Math.abs(remaining))} км`;
    }
    return `${formatKM(remaining)} км`;
  };

  const calculateNextTO1 = (
    currentKM: number | null,
    interval: number | null,
    to2Interval: number | null
  ) => {
    if (!currentKM || !interval) return 0;
    if (!to2Interval || to2Interval <= interval) return 0;

    const completedIntervals = Math.floor(currentKM / interval);
    const nextTO1Point = (completedIntervals + 1) * interval;
    return nextTO1Point - currentKM;
  };

  return (
    <div className="p-3">
      <div className=" flex justify-between items-center mb-3">
        <h1>Список ТС</h1>
        <div>
          <Button
            variant={"default"}
            className="border-[#67c23a] bg-[#f0f9eb] text-[#67c23a] hover:text-white hover:bg-[#67c23a] p-2 text-lg"
          >
            <Link
              href="transport/create"
              className="flex justify-center items-center"
            >
              <CirclePlus />
              <div className=" ml-3">Добавить ТС</div>
            </Link>
          </Button>
        </div>
      </div>
      <Table>
        <TableCaption className="text-2xl font-bold">Список ТС</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Гос Номер</TableHead>
            <TableHead>Пробег</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>До следующего ТО1</TableHead>
            <TableHead>До следующего ТО2</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTransports.map((item) => {
            const category = allCategories.find(
              (category) => category.id === item.categoryId
            );
            const nextTO1 = calculateNextTO1(
              item.generalKM,
              category?.distanceTO1 ?? 0,
              category?.distanceTO2 ?? 0
            );
            const isNearTO1 = nextTO1 <= CRITICAL_DISTANCE && nextTO1 > 0;

            // Получаем статус ТО-2
            const to2Status = calculateNextTO2(
              item.id,
              item.generalKM,
              category?.distanceTO2 ?? null
            );
            const isOverdueTO2 = to2Status.includes("Просрочено");

            return (
              <TableRow key={item.id} className="bg-[#E6F1FD]">
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.gosNumber}</TableCell>
                <TableCell>{formatKM(item?.generalKM)} км</TableCell>
                <TableCell>
                  {
                    allCategories.find(
                      (category) => category.id === item.categoryId
                    )?.name
                  }
                </TableCell>
                <TableCell>
                  {
                    allStatuses.find((status) => status.id === item.statusId)
                      ?.name
                  }
                </TableCell>
                <TableCell
                  className={
                    isNearTO1 ? "text-red-500 font-medium" : "text-green-600"
                  }
                >
                  {formatKM(nextTO1)} км
                </TableCell>
                <TableCell
                  className={
                    isOverdueTO2 ? "text-red-500 font-medium" : "text-green-600"
                  }
                >
                  {to2Status}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button variant={"secondary"} className="m-0 ml-3 p-0">
                      <Link
                        href={`/transport/${item.id}`}
                        className="px-4 py-2 block"
                      >
                        <Eye />
                      </Link>
                    </Button>
                    <Button
                      className="m-0 ml-3 bg-[#34C759] p-0"
                      variant="default"
                    >
                      <Link
                        href={`/transport/${item.id}/edit`}
                        className="px-4 py-2 block"
                      >
                        <SquarePen />
                      </Link>
                    </Button>
                    <AlertDialogDemo
                      id={item.id}
                      deleteItemProps={deleteItem}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
