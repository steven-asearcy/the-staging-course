import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

