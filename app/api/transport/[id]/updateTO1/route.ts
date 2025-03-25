import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataUpdate = await req.json();
  const { isTO1Started } = dataUpdate;
  const transport = await prisma.transport.update({
    where: {
      id: Number(id),
    },
    data: {
      isTO1Started: isTO1Started,
      nextTO1: isTO1Started ? Number(dataUpdate.nextTO1) : null,
    },
  });
  return NextResponse.json(transport);
}
