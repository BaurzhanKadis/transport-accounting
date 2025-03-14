"use client";
import React from "react";

import { Status, Transport } from "@prisma/client";
import { useDebounce } from "react-use";
import { Api } from "@/services/api-client";

export default function Dashboard() {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const statuses = await Api.status.allStatus();
        setAllTransports(response);
        setStatuses(statuses);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
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
              <strong className="text-2xl">0</strong>
            </div>
          </div>
          <div className="p-4 text-slate-500 text-center">
            Нет активных напоминаний
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
