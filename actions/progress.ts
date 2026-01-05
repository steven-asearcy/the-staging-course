"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function toggleLessonProgress(
  lessonId: string,
  isCompleted: boolean
) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  await db.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId,
      },
    },
    update: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      lessonId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  revalidatePath(`/learn/${lesson.chapter.courseId}`);

  return { success: true };
}

