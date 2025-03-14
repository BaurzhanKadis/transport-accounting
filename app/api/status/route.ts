import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  const types = await prisma.status.findMany();
  return NextResponse.json(types);
}
