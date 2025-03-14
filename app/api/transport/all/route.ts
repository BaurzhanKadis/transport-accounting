import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  const allTransport = await prisma.transport.findMany();
  return NextResponse.json(allTransport);
}
