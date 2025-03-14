import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.transport.delete({
    where: {
      id: Number(id),
    },
  });

  const allTransport = await prisma.transport.findMany();

  return NextResponse.json(allTransport);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transport = await prisma.transport.findUnique({
    where: {
      id: Number(id),
    },
  });
  return NextResponse.json(transport);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataUpdate = await req.json();
  const { name, gosNumber, categoryId, statusId, generalKM } = dataUpdate;
  const transport = await prisma.transport.update({
    where: {
      id: Number(id),
    },
    data: {
      name: name,
      gosNumber: gosNumber,
      categoryId: categoryId,
      statusId: statusId,
      generalKM: generalKM,
    },
    select: {
      name: true,
      gosNumber: true,
      categoryId: true,
      statusId: true,
      generalKM: true,
    },
  });
  return NextResponse.json(transport);
}
