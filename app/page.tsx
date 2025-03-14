"use client";
import React from "react";

import { Status, Transport, Category } from "@prisma/client";
import { useDebounce } from "react-use";
import { Api } from "@/services/api-client";

export default function Dashboard() {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const statuses = await Api.status.allStatus();
        const categories = await Api.categoryes.categoryes();
        setAllTransports(response);
        setStatuses(statuses);
        setCategories(categories);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
  );

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

    const nextTO2 = calculateNextTO2(currentKM, to2Interval);
    if (nextTO2 > 0 && nextTO2 <= interval) {
      return 0;
    }

    const completedIntervals = Math.floor(currentKM / interval);
    const nextTO1Point = (completedIntervals + 1) * interval;
    return nextTO1Point - currentKM;
  };

  // Подсчет транспорта, требующего ТО
  const criticalTO = allTransports.reduce(
    (acc, transport) => {
      const category = categories.find((c) => c.id === transport.categoryId);
      if (!category) return acc;

      const nextTO2 = calculateNextTO2(
        transport.generalKM,
        category.distanceTO2
      );
      const nextTO1 = calculateNextTO1(
        transport.generalKM,
        category.distanceTO1,
        category.distanceTO2
      );

      return {
        to1: acc.to1 + (nextTO1 > 0 && nextTO1 <= 1000 ? 1 : 0),
        to2: acc.to2 + (nextTO2 > 0 && nextTO2 <= 1000 ? 1 : 0),
      };
    },
    { to1: 0, to2: 0 }
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800">Панель управления</h1>
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        {/* Блок статистики ТС */}
        <div className="rounded-xl bg-white shadow-lg overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Транспортные средства</span>
              <strong className="text-2xl">{allTransports.length}</strong>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-slate-600">{status.name}</span>
                <span className="font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {
                    allTransports.filter(
                      (transport) => transport.statusId === status.id
                    ).length
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Блок сервисных напоминаний */}
        <div className="rounded-xl bg-white shadow-lg overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Сервисные напоминания</span>
              <strong className="text-2xl">
                {criticalTO.to1 + criticalTO.to2}
              </strong>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-700 font-medium">Требуется ТО-1</div>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
                  {criticalTO.to1}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-700 font-medium">Требуется ТО-2</div>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
                  {criticalTO.to2}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Блок последних действий */}
        <div className="rounded-xl bg-white shadow-lg overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Последние действия</span>
            </div>
          </div>
          <div className="p-4 text-slate-500 text-center">
            История действий пуста
          </div>
        </div>
      </div>
    </div>
  );
}
