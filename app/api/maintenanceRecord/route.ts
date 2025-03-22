import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

// создание пройденного ТО конкретной ТС
// export async function POST(req: NextRequest) {
//   const data = await req.json();
//   const { transportId, description, cost, mileage, type } = data;

//   const maintenanceRecord = await prisma.maintenanceRecord.create({
//     data: {
//       transportId,
//       description,
//       cost,
//       mileage,
//       type,
//     },
//   });

//   return NextResponse.json(maintenanceRecord);
// }

// получение всех записанных ТО
export async function GET() {
  const maintenanceRecordAll = await prisma.maintenanceRecord.findMany();
  return NextResponse.json(maintenanceRecordAll);
}
