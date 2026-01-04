import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LessonForm } from "@/components/admin/lesson-form";
import { ResourcesList } from "@/components/admin/resources-list";
import { LessonPublishButton } from "@/components/admin/lesson-publish-button";

export const metadata: Metadata = {
  title: "Edit Lesson",
  description: "Edit lesson details",
};

async function getLesson(lessonId: string) {
  return db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      resources: {
        orderBy: { createdAt: "asc" },
      },
      chapter: {
        include: {
          course: true,
        },
      },
    },
  });
}

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  const hasContent = lesson.content || lesson.videoUrl;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to course
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
            <Badge variant={lesson.isPublished ? "default" : "secondary"}>
              {lesson.isPublished ? "Published" : "Draft"}
            </Badge>
            {lesson.isFree && (
              <Badge variant="outline">Free Preview</Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            {lesson.chapter.course.title} → {lesson.chapter.title}
          </p>
        </div>
        <LessonPublishButton
          lessonId={lesson.id}
          isPublished={lesson.isPublished}
          disabled={!hasContent}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <LessonForm lesson={lesson} />
        </div>

        <div className="space-y-6">
          <ResourcesList lessonId={lesson.id} resources={lesson.resources} />
        </div>
      </div>
    </div>
  );
}

