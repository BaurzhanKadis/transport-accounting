"use client";
import { Api } from "@/services/api-client";
import { useDebounce } from "react-use";
import { useState, use } from "react";
import { Transport } from "@prisma/client";

export default function TransportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [transport, setTransport] = useState<Transport[]>([]);

  useDebounce(
    async () => {
      try {
        const transport = await Api.transports.getTransport(parseInt(id));
        setTransport([transport]);
      } catch (error) {
        console.log(error);
      }
    },
    20,
    []
  );

  console.log(transport[0], "transport");
  // const distanceTO1 = 5000;
  // const distanceTO1 = 10000;
  // const critDustanceTO = 1000

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Транспортное средство</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p>ID: {transport[0]?.id}</p>
        <p>Название: {transport[0]?.name}</p>
        <p>Гос. номер: {transport[0]?.gosNumber}</p>
        <p>Пробег: {transport[0]?.generalKM} км</p>
        <p>Пробег: {transport[0]?.generalKM} км</p>
      </div>
    </div>
  );
}
