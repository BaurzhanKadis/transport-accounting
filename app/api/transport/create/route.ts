import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, gosNumber, categoryId, statusId, generalKM } = data;
  const transport = await prisma.transport.create({
    data: {
      name: name,
      gosNumber: gosNumber,
      categoryId: categoryId,
      statusId: statusId,
      generalKM: generalKM,
    },
  });

  return NextResponse.json(transport);
}
