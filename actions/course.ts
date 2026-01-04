"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function createCourse(data: { title: string }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const slug = slugify(data.title);

  const existingCourse = await db.course.findUnique({
    where: { slug },
  });

  if (existingCourse) {
    return { error: "A course with this title already exists" };
  }

  const course = await db.course.create({
    data: {
      title: data.title,
      slug,
    },
  });

  revalidatePath("/admin/courses");

  return { success: true, courseId: course.id };
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
  }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return { error: "Course not found" };
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.title && data.title !== course.title) {
    updateData.slug = slugify(data.title);
  }

  await db.course.update({
    where: { id: courseId },
    data: updateData,
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");

  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await db.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/admin/courses");

  return { success: true };
}

export async function publishCourse(courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
  });

  if (!course) {
    return { error: "Course not found" };
  }

  const hasPublishedChapter = course.chapters.some(
    (chapter) => chapter.lessons.length > 0
  );

  if (!hasPublishedChapter) {
    return {
      error:
        "Cannot publish course without at least one published chapter with lessons",
    };
  }

  await db.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");

  return { success: true };
}

export async function unpublishCourse(courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await db.course.update({
    where: { id: courseId },
    data: { isPublished: false },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");

  return { success: true };
}

