"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "react-use";
import { Api } from "@/services/api-client";
import { Transport, Category, MaintenanceRecord } from "@prisma/client";
import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TechnicalMaintenancePage = () => {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = React.useState<
    MaintenanceRecord[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const categories = await Api.categoryes.categoryes();
        const records = await Api.maintenanceRecords.getAllMaintenanceRecords();
        setAllTransports(response);
        setCategories(categories);
        setMaintenanceRecords(records);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
  );

  const calculateNextTO1 = (
    currentKM: number | null,
    interval: number | null
  ) => {
    if (!currentKM || !interval) return 0;

    // Если пробег меньше первого интервала ТО, просто вычисляем оставшееся расстояние
    if (currentKM < interval) {
      return interval - currentKM;
    }

    // Находим количество пройденных интервалов
    const completedIntervals = Math.floor(currentKM / interval);

    // Следующая точка ТО-1
    const nextTO1Point = (completedIntervals + 1) * interval;

    // Текущая точка ТО-1 (последняя пройденная)
    const currentTO1Point = completedIntervals * interval;

    // Если мы находимся ровно на точке ТО, считаем что нужно пройти полный интервал
    if (currentKM === currentTO1Point) {
      return interval;
    }

    // Если мы прошли точку ТО, значит оно просрочено
    if (currentKM > currentTO1Point) {
      return -(currentKM - currentTO1Point);
    }

    // В остальных случаях считаем расстояние до следующей точки
    return nextTO1Point - currentKM;
  };

  // Функция для получения последней записи ТО-2 для транспорта
  const getLastTO2Record = (transportId: number) => {
    return maintenanceRecords
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
  ): number => {
    if (!currentKM || !interval) return 0;

    const lastTO2 = getLastTO2Record(transportId);
    if (!lastTO2) {
      return 0;
    }

    const nextTO2Point = lastTO2.mileage + interval;
    return nextTO2Point - currentKM;
  };

  const getTransportsNeedingTO1 = () => {
    return allTransports
      .map((transport) => {
        const category = categories.find((c) => c.id === transport.categoryId);
        if (!category?.distanceTO1) return null;

        const nextTO1 = calculateNextTO1(
          transport.generalKM,
          category.distanceTO1
        );

        return {
          ...transport,
          remainingKM: nextTO1,
          category,
        };
      })
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== null && item.remainingKM !== 0
      )
      .sort((a, b) => a.remainingKM - b.remainingKM);
  };

  const getTransportsNeedingTO2 = () => {
    return allTransports
      .map((transport) => {
        const category = categories.find((c) => c.id === transport.categoryId);
        if (!category?.distanceTO2) return null;

        const nextTO2 = calculateNextTO2(
          transport.id,
          transport.generalKM,
          category.distanceTO2
        );

        return {
          ...transport,
          remainingKM: nextTO2,
          category,
        };
      })
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== null && item.remainingKM !== 0
      )
      .sort((a, b) => a.remainingKM - b.remainingKM);
  };

  const transportsTO1 = getTransportsNeedingTO1();
  const transportsTO2 = getTransportsNeedingTO2();

  const getTO1Stats = () => {
    const overdue = transportsTO1.filter((t) => t.remainingKM < 0).length;
    const approaching = transportsTO1.filter(
      (t) => t.remainingKM > 0 && t.remainingKM <= 1000
    ).length;
    return { overdue, approaching };
  };

  const getTO2Stats = () => {
    const overdue = transportsTO2.filter((t) => t.remainingKM < 0).length;
    const approaching = transportsTO2.filter(
      (t) => t.remainingKM > 0 && t.remainingKM <= 1000
    ).length;
    return { overdue, approaching };
  };

  const to1Stats = getTO1Stats();
  const to2Stats = getTO2Stats();

  const filteredTransportsTO1 = transportsTO1.filter(
    (transport) =>
      transport.gosNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transport.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransportsTO2 = transportsTO2.filter(
    (transport) =>
      transport.gosNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transport.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Техническое обслуживание
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Поиск по гос. номеру или названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ТО-1 Просрочено
            </CardTitle>
            <Badge variant="destructive">{to1Stats.overdue}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{to1Stats.overdue}</div>
            <p className="text-xs text-slate-500">транспортных средств</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ТО-1 Приближается
            </CardTitle>
            <Badge variant="warning">{to1Stats.approaching}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{to1Stats.approaching}</div>
            <p className="text-xs text-slate-500">транспортных средств</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ТО-2 Просрочено
            </CardTitle>
            <Badge variant="destructive">{to2Stats.overdue}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{to2Stats.overdue}</div>
            <p className="text-xs text-slate-500">транспортных средств</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ТО-2 Приближается
            </CardTitle>
            <Badge variant="warning">{to2Stats.approaching}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{to2Stats.approaching}</div>
            <p className="text-xs text-slate-500">транспортных средств</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="to1" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="to1">
            ТО-1{" "}
            <div className="ml-2 flex gap-2">
              {to1Stats.overdue > 0 && (
                <span className="count-number text-white rounded-full bg-red-600 px-2">
                  {to1Stats.overdue}
                </span>
              )}
              {to1Stats.approaching > 0 && (
                <span className="count-number text-white rounded-full bg-amber-500 px-2">
                  {to1Stats.approaching}
                </span>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="to2">
            ТО-2{" "}
            <div className="ml-2 flex gap-2">
              {to2Stats.overdue > 0 && (
                <span className="count-number text-white rounded-full bg-red-600 px-2">
                  {to2Stats.overdue}
                </span>
              )}
              {to2Stats.approaching > 0 && (
                <span className="count-number text-white rounded-full bg-amber-500 px-2">
                  {to2Stats.approaching}
                </span>
              )}
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="to1">
          <div className="grid gap-4">
            {filteredTransportsTO1
              .filter((transport) => !transport.isTO1Started)
              .map((transport) => (
                <Link
                  key={transport.id}
                  className="bg-white p-4 rounded-lg shadow border border-slate-200 hover:border-slate-300 transition-colors"
                  href={`/technical-maintenance/${transport.id}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-medium text-slate-800">
                        {transport.name || "Без названия"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{transport.gosNumber}</Badge>
                        <Badge variant="outline">
                          {transport.generalKM?.toLocaleString()} км
                        </Badge>
                        <Badge variant="outline" className="hidden md:inline">
                          {transport.category.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Интервал ТО-1:{" "}
                        {transport.category.distanceTO1?.toLocaleString()} км
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">До ТО-1:</p>
                      <Badge
                        variant={
                          transport.remainingKM <= 0
                            ? "destructive"
                            : transport.remainingKM <= 1000
                            ? "warning"
                            : "default"
                        }
                      >
                        {transport.remainingKM < 0 ? "Просрочено на " : ""}
                        {Math.abs(transport.remainingKM)} км
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            {filteredTransportsTO1.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Нет транспорта, требующего ТО-1
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="to2">
          <div className="grid gap-4">
            {filteredTransportsTO2
              .filter((transport) => !transport.isTO2Started)
              .map((transport) => (
                <Link
                  key={transport.id}
                  className="bg-white p-4 rounded-lg shadow border border-slate-200 hover:border-slate-300 transition-colors"
                  href={`/technical-maintenance/${transport.id}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-medium text-slate-800">
                        {transport.name || "Без названия"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{transport.gosNumber}</Badge>
                        <Badge variant="outline">
                          {transport.generalKM?.toLocaleString()} км
                        </Badge>
                        <Badge variant="outline" className="hidden md:inline">
                          {transport.category.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Интервал ТО-2:{" "}
                        {transport.category.distanceTO2?.toLocaleString()} км
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">До ТО-2:</p>
                      <Badge
                        variant={
                          transport.remainingKM <= 0
                            ? "destructive"
                            : transport.remainingKM <= 1000
                            ? "warning"
                            : "default"
                        }
                      >
                        {transport.remainingKM < 0 ? "Просрочено на " : ""}
                        {Math.abs(transport.remainingKM)} км
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            {filteredTransportsTO2.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Нет транспорта, требующего ТО-2
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalMaintenancePage;
