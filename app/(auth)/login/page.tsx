import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            The Staging Course
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your courses
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Transform spaces. Elevate your career.
        </p>
      </div>
    </div>
  );
}

