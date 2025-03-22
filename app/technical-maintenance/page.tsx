"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "react-use";
import { Api } from "@/services/api-client";
import { Transport, Category } from "@prisma/client";
import React from "react";
import Link from "next/link";

const TechnicalMaintenancePage = () => {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const categories = await Api.categoryes.categoryes();
        setAllTransports(response);
        setCategories(categories);
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

  const calculateNextTO2 = (
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

    // Следующая точка ТО-2
    const nextTO2Point = (completedIntervals + 1) * interval;

    // Текущая точка ТО-2 (последняя пройденная)
    const currentTO2Point = completedIntervals * interval;

    // Если мы находимся ровно на точке ТО, считаем что нужно пройти полный интервал
    if (currentKM === currentTO2Point) {
      return interval;
    }

    // Если мы прошли точку ТО, значит оно просрочено
    if (currentKM > currentTO2Point) {
      return -(currentKM - currentTO2Point);
    }

    // В остальных случаях считаем расстояние до следующей точки
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Техническое обслуживание
      </h1>
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
            {transportsTO1.map((transport) => (
              <Link
                key={transport.id}
                className="bg-white p-4 rounded-lg shadow border border-slate-200"
                href={`/technical-maintenance/${transport.id}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    {/* <h3 className="font-medium text-slate-800">
                      {transport.name}
                    </h3> */}
                    <p className="text-sm text-slate-500">
                      Гос. номер: {transport.gosNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      Общий пробег: {transport.generalKM?.toLocaleString()} км
                    </p>
                    <p className="text-sm text-slate-500 hidden md:block">
                      Категория: {transport.category.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Интервал ТО-1:{" "}
                      {transport.category.distanceTO1?.toLocaleString()} км
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">До ТО-1:</p>
                    <p
                      className={`font-medium ${
                        transport.remainingKM <= 0
                          ? "text-red-600"
                          : transport.remainingKM <= 1000
                          ? "text-amber-600"
                          : "text-slate-800"
                      }`}
                    >
                      {transport.remainingKM < 0 ? "Просрочено на " : ""}
                      {Math.abs(transport.remainingKM)} км
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {transportsTO1.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                Нет транспорта, требующего ТО-1
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="to2">
          <div className="grid gap-4">
            {transportsTO2.map((transport) => (
              <Link
                key={transport.id}
                href={`technical-maintenance/${transport.id}`}
                className="bg-white p-4 rounded-lg shadow border border-slate-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-slate-800">
                      {transport.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Гос. номер: {transport.gosNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      Общий пробег: {transport.generalKM?.toLocaleString()} км
                    </p>
                    <p className="text-sm text-slate-500 hidden md:block">
                      Категория: {transport.category.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Интервал ТО-2:{" "}
                      {transport.category.distanceTO2?.toLocaleString()} км
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">До ТО-2:</p>
                    <p
                      className={`font-medium ${
                        transport.remainingKM <= 0
                          ? "text-red-600"
                          : transport.remainingKM <= 1000
                          ? "text-amber-600"
                          : "text-slate-800"
                      }`}
                    >
                      {transport.remainingKM < 0 ? "Просрочено на " : ""}
                      {Math.abs(transport.remainingKM)} км
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {transportsTO2.length === 0 && (
              <div className="text-center text-slate-500 py-8">
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
