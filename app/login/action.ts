"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const redirectTo = (formData.get("redirectTo") as string) || "/";

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const redirectTo = (formData.get("redirectTo") as string) || "/";

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();

  // URL для перенаправления после успешной аутентификации
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  // Если передан redirectTo, добавляем его к URL для обратного вызова
  const finalCallbackUrl = redirectTo
    ? `${callbackUrl}?redirectTo=${encodeURIComponent(redirectTo)}`
    : callbackUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: finalCallbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Error signing in with Google:", error);
    redirect("/error");
  }

  if (data?.url) {
    return data;
  }

  return data;
}
