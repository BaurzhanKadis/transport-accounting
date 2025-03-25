import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, gosNumber, categoryId, statusId, generalKM } = data;

    const transport = await prisma.transport.create({
      data: {
        name,
        gosNumber,
        categoryId,
        statusId,
        generalKM,
        userId: user.id,
      },
    });

    return NextResponse.json(transport);
  } catch (error) {
    console.error("Error creating transport:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
