import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "@/components/admin/course-form";
import { ChaptersList } from "@/components/admin/chapters-list";
import { PublishButton } from "@/components/admin/publish-button";

export const metadata: Metadata = {
  title: "Edit Course",
  description: "Edit course details",
};

async function getCourse(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              resources: true,
            },
          },
        },
      },
    },
  });
}

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  const publishedLessons = course.chapters.reduce(
    (acc, chapter) =>
      acc + chapter.lessons.filter((lesson) => lesson.isPublished).length,
    0
  );

  const completionFields = [
    course.title,
    course.description,
    course.price > 0,
    course.chapters.some((chapter) =>
      chapter.lessons.some((lesson) => lesson.isPublished)
    ),
  ];

  const completedFields = completionFields.filter(Boolean).length;
  const isComplete = completedFields === completionFields.length;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/courses">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to courses
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            {completedFields}/{completionFields.length} fields completed ·{" "}
            {course.chapters.length} chapters · {publishedLessons}/{totalLessons}{" "}
            lessons published
          </p>
        </div>
        <PublishButton
          courseId={course.id}
          isPublished={course.isPublished}
          disabled={!isComplete}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CourseForm course={course} />
        </div>

        <div className="space-y-6">
          <ChaptersList courseId={course.id} chapters={course.chapters} />
        </div>
      </div>
    </div>
  );
}

