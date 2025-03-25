import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataUpdate = await req.json();
  const { isTO2Started } = dataUpdate;
  const transport = await prisma.transport.update({
    where: {
      id: Number(id),
    },
    data: {
      isTO2Started: isTO2Started,
      nextTO2: isTO2Started ? Number(dataUpdate.nextTO2) : null,
    },
  });
  return NextResponse.json(transport);
}
