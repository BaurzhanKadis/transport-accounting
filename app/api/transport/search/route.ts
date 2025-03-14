import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  const transports = await prisma.transport.findMany({
    where: {
      gosNumber: {
        contains: query,
        mode: "insensitive",
      },
    },
  });
  return NextResponse.json(transports);
}
