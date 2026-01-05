"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function enrollInCourse(courseId: string) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Please sign in to enroll" };
  }

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
  });

  if (!course) {
    return { error: "Course not found" };
  }

  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    return { error: "Already enrolled in this course" };
  }

  if (course.price > 0) {
    return { error: "Payment required for this course" };
  }

  await db.enrollment.create({
    data: {
      userId: session.user.id,
      courseId,
      purchaseType: "ONE_TIME",
      enrollmentMethod: "PURCHASE",
    },
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard");

  return { success: true };
}

