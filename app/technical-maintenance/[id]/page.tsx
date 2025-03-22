"use client";
import React, { use, useState } from "react";
// import { useParams } from "next/navigation";
import { Api } from "@/services/api-client";
import { Transport, MaintenanceRecord, Category } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle } from "lucide-react";
import { useDebounce } from "react-use";

export default function MaintenanceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [transport, setTransport] = useState<Transport | null>(null);
  //   const [transport, setTransport] = useState<Transport[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [category, setCategory] = React.useState<Category | null>(null);

  //   useDebounce(
  //     async () => {
  //       try {
  //         const transportData = await Api.transports.getTransport(parseInt(id));
  //         setTransport(transportData);
  //         console.log(transport);

  //         const categories = await Api.categoryes.categoryes();
  //         const transportCategory = categories.find(
  //           (c) => c.id === transportData.categoryId
  //         );
  //         setCategory(transportCategory || null);

  //         const records = await Api.maintenanceRecords.getByTransportId(
  //           Number(id)
  //         );
  //         // Сортируем записи по дате, новые сверху
  //         // const sortedRecords = Array.from(records).sort(
  //         //   (a: MaintenanceRecord, b: MaintenanceRecord) =>
  //         //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //         // );
  //         // setMaintenanceRecords(sortedRecords);
  //         setMaintenanceRecords(records);
  //       } catch (error) {
  //         console.error("Ошибка при загрузке данных:", error);
  //       }
  //     },
  //     250,
  //     []
  //   );

  useDebounce(
    async () => {
      try {
        const transportData = await Api.transports.getTransport(parseInt(id));

        if (!transportData) {
          console.error("Транспорт не найден");
          return;
        }

        setTransport(transportData); // <-- Убедись, что useState<Transport | null>
        console.log(transportData);

        const categories = await Api.categoryes.categoryes();
        const transportCategory = categories.find(
          (c) => c.id === transportData.categoryId
        );
        setCategory(transportCategory || null);

        const records = await Api.maintenanceRecords.getByTransportId(
          Number(id)
        );

        setMaintenanceRecords(records);
        // console.log(records);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    },
    250,
    [id]
  );

  //   React.useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const transportData = await Api.transports.getTransport(Number(id));
  //         setTransport(transportData);

  //         const categories = await Api.categoryes.categoryes();
  //         const transportCategory = categories.find(
  //           (c) => c.id === transportData.categoryId
  //         );
  //         setCategory(transportCategory || null);

  //         const records = await Api.maintenanceRecords.getByTransportId(
  //           Number(id)
  //         );
  //         // Сортируем записи по дате, новые сверху
  //         const sortedRecords = records.sort(
  //           (a, b) =>
  //             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //         );
  //         setMaintenanceRecords(sortedRecords);
  //       } catch (error) {
  //         console.error("Ошибка при загрузке данных:", error);
  //       }
  //     };

  //     if (id) {
  //       fetchData();
  //     }
  //   }, [id]);

  if (!transport) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin" />
        <p className="ml-2">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        История технического обслуживания: {transport.name}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Информация о транспорте</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600">Гос. номер:</p>
            <p className="font-medium">{transport.gosNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Общий пробег:</p>
            <p className="font-medium">
              {transport.generalKM?.toLocaleString()} км
            </p>
          </div>
          <div>
            <p className="text-gray-600">Категория:</p>
            <p className="font-medium">{category?.name || "Не указана"}</p>
          </div>
          <div>
            <p className="text-gray-600">Интервалы ТО:</p>
            <p className="font-medium">
              ТО-1: {category?.distanceTO1?.toLocaleString() || "-"} км
              <br />
              ТО-2: {category?.distanceTO2?.toLocaleString() || "-"} км
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableCaption>
            {maintenanceRecords.length === 0
              ? "История технического обслуживания пуста"
              : "История технического обслуживания"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип ТО</TableHead>
              <TableHead>Пробег</TableHead>
              <TableHead>Описание работ</TableHead>
              <TableHead className="text-right">Стоимость</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.mileage?.toLocaleString()} км</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell className="text-right">
                  {record.cost?.toLocaleString()} ₽
                </TableCell>
              </TableRow>
            ))}
            {maintenanceRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Записей о техническом обслуживании пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
