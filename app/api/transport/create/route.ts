import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // const supabase = await createClient();
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const data = await req.json();
    const { name, gosNumber, categoryId, statusId, generalKM, userId } = data;

    // Проверяем существование категории и статуса
    // const [category, status] = await Promise.all([
    //   prisma.category.findUnique({
    //     where: { id: categoryId },
    //   }),
    //   prisma.status.findUnique({
    //     where: { id: statusId },
    //   }),
    // ]);

    // if (!category || !status) {
    //   return NextResponse.json(
    //     { error: "Invalid category or status" },
    //     { status: 400 }
    //   );
    // }

    // console.log("Creating transport with data:", {
    //   name,
    //   gosNumber,
    //   categoryId,
    //   statusId,
    //   generalKM,
    //   userId: user.id,
    // });

    const transport = await prisma.transport.create({
      data: {
        name,
        gosNumber,
        categoryId,
        statusId,
        generalKM,
        userId,
        // userId: user.id,
        // userId
      },
    });

    return NextResponse.json(transport);
  } catch (error) {
    console.error("Detailed error creating transport:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
