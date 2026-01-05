import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ChevronLeft, ChevronRight, FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LessonCompleteButton } from "@/components/courses/lesson-complete-button";
import { VideoPlayer } from "@/components/courses/video-player";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
  });

  return {
    title: lesson?.title || "Lesson",
  };
}

async function getLesson(lessonId: string) {
  return db.lesson.findUnique({
    where: { id: lessonId, isPublished: true },
    include: {
      resources: {
        orderBy: { createdAt: "asc" },
      },
      chapter: {
        include: {
          course: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true, position: true },
          },
        },
      },
    },
  });
}

async function getProgress(userId: string, lessonId: string) {
  return db.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });
}

async function getAllLessons(courseId: string) {
  const chapters = await db.chapter.findMany({
    where: { courseId, isPublished: true },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: { id: true },
      },
    },
  });

  return chapters.flatMap((c) => c.lessons);
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  const progress = await getProgress(session.user.id, lessonId);
  const allLessons = await getAllLessons(courseId);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">{lesson.title}</h1>
        <LessonCompleteButton
          lessonId={lesson.id}
          courseId={courseId}
          isCompleted={progress?.isCompleted ?? false}
          nextLessonId={nextLesson?.id}
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {lesson.videoUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <VideoPlayer url={lesson.videoUrl} />
            </div>
          )}

          {lesson.content && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{lesson.content}</div>
            </div>
          )}

          {lesson.resources.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-4">Resources</h2>
                <div className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      {resource.type === "PDF" ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : resource.type === "LINK" ? (
                        <ExternalLink className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Download className="h-5 w-5 text-green-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.type}
                        </p>
                      </div>
                      <Badge variant="outline">Download</Badge>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="border-t px-6 py-4">
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link href={`/learn/${courseId}/lessons/${prevLesson.id}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Lesson
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button asChild>
              <Link href={`/learn/${courseId}/lessons/${nextLesson.id}`}>
                Next Lesson
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href={`/courses/${lesson.chapter.course.slug}`}>
                Back to Course
              </Link>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

