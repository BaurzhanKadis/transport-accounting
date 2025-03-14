"use client";
import { Api } from "@/services/api-client";
import React from "react";
import { useDebounce } from "react-use";
import { Category, Status, Transport } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CirclePlus, Eye, SquarePen } from "lucide-react";
import { AlertDialogDemo } from "@/components/shared/alert";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTransports.map((item) => (
            <TableRow key={item.id} className="bg-[#E6F1FD]">
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.gosNumber}</TableCell>
              <TableCell>{item.generalKM}</TableCell>
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
              <TableCell>
                <div className="flex items-center">
                  <Button variant={"secondary"} className="m-0 ml-3 p-0">
                    <Link
                      href={`/transport/${item.id}`}
                      className=" px-4 py-2 block"
                    >
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    className="m-0 ml-3 bg-[#34C759] p-0 "
                    variant="default"
                  >
                    <Link
                      href={`/transport/${item.id}/edit`}
                      className=" px-4 py-2 block"
                    >
                      <SquarePen />
                    </Link>
                  </Button>
                  <AlertDialogDemo id={item.id} deleteItemProps={deleteItem} />
                </div>
                {/* <AlertDialogDemo id={item.id} deleteItemProps={deleteItem} /> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
