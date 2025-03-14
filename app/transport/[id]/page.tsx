"use client";
import { Api } from "@/services/api-client";
import { useDebounce } from "react-use";
import { useState, use } from "react";
import { Category, Transport } from "@prisma/client";
import { CRITICAL_DISTANCE } from "@/services/constants";

// const TO_INTERVAL = 5000; // Интервал ТО в километрах
// const CRITICAL_DISTANCE = 1000; // Критическое расстояние до ТО

export default function TransportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [transport, setTransport] = useState<Transport[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  useDebounce(
    async () => {
      try {
        const transport = await Api.transports.getTransport(parseInt(id));
        const categories = await Api.categoryes.categoryes();
        const currentCategory = categories.find(
          (c) => c.id === transport.categoryId
        );
        setCategory(currentCategory || null);
        setTransport([transport]);
      } catch (error) {
        console.log(error);
      }
    },
    20,
    []
  );

  const formatKM = (km: number | null | undefined) => {
    if (typeof km === "undefined" || km === null) return "0";
    return km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const calculateNextTO2 = (
    currentKM: number | null,
    interval: number | null
  ) => {
    if (!currentKM || !interval || !category?.distanceTO1) return 0;
    if (interval <= category.distanceTO1) return 0;

    const completedIntervals = Math.floor(currentKM / interval);
    const nextTO2Point = (completedIntervals + 1) * interval;
    return nextTO2Point - currentKM;
  };

  const calculateNextTO1 = (
    currentKM: number | null,
    interval: number | null
  ) => {
    if (!currentKM || !interval) return 0;

    // Сначала проверяем, нужно ли пройти ТО-2
    const nextTO2 = calculateNextTO2(currentKM, category?.distanceTO2 || null);

    // Если подходит время ТО-2, то ТО-1 должно ждать
    if (nextTO2 > 0 && nextTO2 <= interval) {
      return 0;
    }

    const completedIntervals = Math.floor(currentKM / interval);
    const nextTO1Point = (completedIntervals + 1) * interval;
    return nextTO1Point - currentKM;
  };

  const currentTransport = transport[0];
  const nextTO2 = calculateNextTO2(
    currentTransport?.generalKM,
    category?.distanceTO2 || null
  );
  const nextTO1 = calculateNextTO1(
    currentTransport?.generalKM,
    category?.distanceTO1 || null
  );
  const isNearTO1 = nextTO1 <= CRITICAL_DISTANCE && nextTO1 > 0;
  const isNearTO2 = nextTO2 <= CRITICAL_DISTANCE && nextTO2 > 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Транспортное средство</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p>ID: {currentTransport?.id}</p>
        <p>Название: {currentTransport?.name}</p>
        <p>Гос. номер: {currentTransport?.gosNumber}</p>
        <p>Пробег: {formatKM(currentTransport?.generalKM)} км</p>
        <div className="mt-4 space-y-2">
          {category?.distanceTO1 ? (
            <p
              className={`font-medium ${
                isNearTO1 ? "text-red-500" : "text-green-600"
              }`}
            >
              До ТО-1 ({formatKM(category?.distanceTO1)} км):{" "}
              {formatKM(nextTO1)} км
            </p>
          ) : null}
          {category?.distanceTO2 &&
          category?.distanceTO2 > (category?.distanceTO1 ?? 0) ? (
            <p
              className={`font-medium ${
                isNearTO2 ? "text-red-500" : "text-green-600"
              }`}
            >
              До ТО-2 ({formatKM(category?.distanceTO2)} км):{" "}
              {formatKM(nextTO2)} км
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
