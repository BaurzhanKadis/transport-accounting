import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   const maintenanceRecordItem = await prisma.maintenanceRecord.findUnique({
//     where: {
//       id: Number(id),
//     },
//   });
//   return NextResponse.json(maintenanceRecordItem);
// }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // const { transportId } = params;
  const { id } = await params;

  const maintenanceRecords = await prisma.maintenanceRecord.findMany({
    where: {
      transportId: Number(id), // Фильтрация по ID транспорта
    },
    orderBy: {
      date: "desc", // Сортировка по дате (сначала последние ТО)
    },
  });
  console.log(maintenanceRecords);

  if (!maintenanceRecords.length) {
    return NextResponse.json({ error: "Записи не найдены" }, { status: 404 });
  }

  return NextResponse.json(maintenanceRecords);
}
