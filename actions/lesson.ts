"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createLesson(data: { title: string; chapterId: string }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.findUnique({
    where: { id: data.chapterId },
  });

  if (!chapter) {
    return { error: "Chapter not found" };
  }

  const lastLesson = await db.lesson.findFirst({
    where: { chapterId: data.chapterId },
    orderBy: { position: "desc" },
  });

  const position = lastLesson ? lastLesson.position + 1 : 0;

  const lesson = await db.lesson.create({
    data: {
      title: data.title,
      chapterId: data.chapterId,
      position,
    },
  });

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true, lessonId: lesson.id };
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    content?: string;
    videoUrl?: string;
    isFree?: boolean;
  }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data,
  });

  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  await db.lesson.delete({
    where: { id: lessonId },
  });

  const remainingLessons = await db.lesson.findMany({
    where: { chapterId: lesson.chapterId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < remainingLessons.length; i++) {
    await db.lesson.update({
      where: { id: remainingLessons[i].id },
      data: { position: i },
    });
  }

  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

  return { success: true };
}

export async function reorderLessons(chapterId: string, orderedIds: string[]) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    return { error: "Chapter not found" };
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await db.lesson.update({
      where: { id: orderedIds[i] },
      data: { position: i },
    });
  }

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true };
}

export async function publishLesson(lessonId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  if (!lesson.title || (!lesson.content && !lesson.videoUrl)) {
    return { error: "Lesson must have a title and content or video" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: { isPublished: true },
  });

  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

  return { success: true };
}

export async function unpublishLesson(lessonId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: { isPublished: false },
  });

  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

  return { success: true };
}

