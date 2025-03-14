"use client";
import { Api } from "@/services/api-client";
import React from "react";
import { useDebounce } from "react-use";
import { Category, Status, Transport } from "@prisma/client";
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

// const TO1_INTERVAL = 5000; // Интервал ТО1 в километрах
// const TO2_INTERVAL = 10000; // Интервал ТО2 в километрах

export default function TransportPage() {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [allStatuses, setAllStatuses] = React.useState<Status[]>([]);

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const categories = await Api.categoryes.categoryes();
        const statuses = await Api.status.allStatus();
        setAllTransports(response);
        setAllCategories(categories);
        setAllStatuses(statuses);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
  );

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

  const calculateNextTO2 = (
    currentKM: number | null,
    interval: number | null
  ) => {
    if (!currentKM || !interval) return 0;
    const completedIntervals = Math.floor(currentKM / interval);
    const nextTO2Point = (completedIntervals + 1) * interval;
    return nextTO2Point - currentKM;
  };

  const calculateNextTO1 = (
    currentKM: number | null,
    interval: number | null,
    to2Interval: number | null
  ) => {
    if (!currentKM || !interval) return 0;
    if (!to2Interval || to2Interval <= interval) return 0;

    // Сначала проверяем, нужно ли пройти ТО-2
    const nextTO2 = calculateNextTO2(currentKM, to2Interval);

    // Если подходит время ТО-2, то ТО-1 должно ждать
    if (nextTO2 > 0 && nextTO2 <= interval) {
      return 0;
    }

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
            const nextTO2 = calculateNextTO2(
              item.generalKM,
              category?.distanceTO2 ?? 0
            );
            const nextTO1 = calculateNextTO1(
              item.generalKM,
              category?.distanceTO1 ?? 0,
              category?.distanceTO2 ?? 0
            );
            const isNearTO1 = nextTO1 <= CRITICAL_DISTANCE && nextTO1 > 0;
            const isNearTO2 = nextTO2 <= CRITICAL_DISTANCE && nextTO2 > 0;

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
                    isNearTO2 ? "text-red-500 font-medium" : "text-green-600"
                  }
                >
                  {formatKM(nextTO2)} км
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
