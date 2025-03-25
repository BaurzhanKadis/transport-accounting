"use client";

import { login, signup, signInWithGoogle } from "@/app/login/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Добро пожаловать
          </CardTitle>
          <CardDescription className="text-center">
            Войдите в свой аккаунт или создайте новый
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" formAction={login}>
            Войти
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                или
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" formAction={signup}>
            Создать аккаунт
          </Button>
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Войти через Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
