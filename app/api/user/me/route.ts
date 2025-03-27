import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User data:", {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
