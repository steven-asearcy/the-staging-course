"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createChapter(data: { title: string; courseId: string }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lastChapter = await db.chapter.findFirst({
    where: { courseId: data.courseId },
    orderBy: { position: "desc" },
  });

  const position = lastChapter ? lastChapter.position + 1 : 0;

  const chapter = await db.chapter.create({
    data: {
      title: data.title,
      courseId: data.courseId,
      position,
    },
  });

  revalidatePath(`/admin/courses/${data.courseId}`);

  return { success: true, chapterId: chapter.id };
}

export async function updateChapter(
  chapterId: string,
  data: {
    title?: string;
    description?: string;
  }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.update({
    where: { id: chapterId },
    data,
  });

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true };
}

export async function deleteChapter(chapterId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.delete({
    where: { id: chapterId },
  });

  const remainingChapters = await db.chapter.findMany({
    where: { courseId: chapter.courseId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < remainingChapters.length; i++) {
    await db.chapter.update({
      where: { id: remainingChapters[i].id },
      data: { position: i },
    });
  }

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true };
}

export async function reorderChapters(
  courseId: string,
  orderedIds: string[]
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await db.chapter.update({
      where: { id: orderedIds[i] },
      data: { position: i },
    });
  }

  revalidatePath(`/admin/courses/${courseId}`);

  return { success: true };
}

export async function publishChapter(chapterId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      lessons: {
        where: { isPublished: true },
      },
    },
  });

  if (!chapter) {
    return { error: "Chapter not found" };
  }

  if (chapter.lessons.length === 0) {
    return { error: "Cannot publish chapter without published lessons" };
  }

  await db.chapter.update({
    where: { id: chapterId },
    data: { isPublished: true },
  });

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true };
}

export async function unpublishChapter(chapterId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const chapter = await db.chapter.update({
    where: { id: chapterId },
    data: { isPublished: false },
  });

  revalidatePath(`/admin/courses/${chapter.courseId}`);

  return { success: true };
}

