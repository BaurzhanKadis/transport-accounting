import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataUpdate = await req.json();
  const { id: statusId } = dataUpdate;
  const transport = await prisma.transport.update({
    where: {
      id: Number(id),
    },
    data: {
      statusId: statusId,
    },
    select: {
      statusId: true,
    },
  });
  return NextResponse.json(transport);
}
