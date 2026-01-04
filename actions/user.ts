"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  notes?: string;
  role?: UserRole;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return { error: "A user with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashedPassword,
      phone: data.phone || null,
      notes: data.notes || null,
      role: data.role || "USER",
    },
  });

  revalidatePath("/admin/students");

  return { success: true, userId: user.id };
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    role?: UserRole;
    isActive?: boolean;
  }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists" };
    }
  }

  await db.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/admin/students");

  return { success: true };
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { id: userId },
    data: { hashedPassword },
  });

  revalidatePath(`/admin/students/${userId}`);

  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (session.user.id === userId) {
    return { error: "You cannot delete your own account" };
  }

  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/students");

  return { success: true };
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    return { error: "User is already enrolled in this course" };
  }

  await db.enrollment.create({
    data: {
      userId,
      courseId,
      purchaseType: "ONE_TIME",
      enrollmentMethod: "MANUAL",
      enrolledById: session.user.id,
    },
  });

  revalidatePath(`/admin/students/${userId}`);

  return { success: true };
}

export async function unenrollUserFromCourse(userId: string, courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await db.enrollment.delete({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  revalidatePath(`/admin/students/${userId}`);

  return { success: true };
}

