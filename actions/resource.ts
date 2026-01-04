"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ResourceType } from "@prisma/client";

export async function createResource(data: {
  title: string;
  url: string;
  type: ResourceType;
  lessonId: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: data.lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    return { error: "Lesson not found" };
  }

  const resource = await db.resource.create({
    data: {
      title: data.title,
      url: data.url,
      type: data.type,
      lessonId: data.lessonId,
    },
  });

  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

  return { success: true, resourceId: resource.id };
}

export async function deleteResource(resourceId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const resource = await db.resource.findUnique({
    where: { id: resourceId },
    include: {
      lesson: {
        include: { chapter: true },
      },
    },
  });

  if (!resource) {
    return { error: "Resource not found" };
  }

  await db.resource.delete({
    where: { id: resourceId },
  });

  revalidatePath(`/admin/courses/${resource.lesson.chapter.courseId}`);

  return { success: true };
}

