import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CourseSidebar } from "@/components/courses/course-sidebar";

async function getCourse(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}

async function getEnrollment(userId: string, courseId: string) {
  return db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });
}

async function getProgress(userId: string, courseId: string) {
  const lessons = await db.lesson.findMany({
    where: {
      chapter: {
        courseId,
        isPublished: true,
      },
      isPublished: true,
    },
    select: { id: true },
  });

  const progress = await db.lessonProgress.findMany({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });

  return progress.reduce(
    (acc, p) => {
      acc[p.lessonId] = p.isCompleted;
      return acc;
    },
    {} as Record<string, boolean>
  );
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  const enrollment = await getEnrollment(session.user.id, course.id);

  if (!enrollment) {
    redirect(`/courses/${course.slug}`);
  }

  const progress = await getProgress(session.user.id, course.id);

  return (
    <div className="h-screen flex">
      <CourseSidebar course={course} progress={progress} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

