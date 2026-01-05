import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { BookOpen, Clock, CheckCircle, PlayCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnrollButton } from "@/components/courses/enroll-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
  });

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: course.title,
    description: course.description || undefined,
  };
}

async function getCourse(slug: string) {
  return db.course.findUnique({
    where: { slug, isPublished: true },
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

  const completedLessons = await db.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      isCompleted: true,
    },
  });

  return {
    total: lessons.length,
    completed: completedLessons,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const session = await auth();
  const enrollment = session?.user
    ? await getEnrollment(session.user.id, course.id)
    : null;

  const progress = session?.user && enrollment
    ? await getProgress(session.user.id, course.id)
    : null;

  const lessonCount = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  const firstLesson = course.chapters[0]?.lessons[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/aspnospace.png"
              alt="The Staging Course"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">The Staging Course</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Courses
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <div className="bg-gradient-to-b from-secondary/50 to-background">
          <div className="container mx-auto px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Badge variant="secondary" className="mb-4">
                  {course.chapters.length} chapters · {lessonCount} lessons
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {course.description}
                  </p>
                )}

                {enrollment && progress && (
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>
                        {progress.completed} of {progress.total} lessons
                        completed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
                  <div className="aspect-video relative bg-muted">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-4 text-center">
                      <span className="text-3xl font-bold">
                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                      </span>
                    </div>

                    {enrollment ? (
                      <Button asChild className="w-full" size="lg">
                        <Link
                          href={`/learn/${course.id}/lessons/${firstLesson?.id}`}
                        >
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Continue Learning
                        </Link>
                      </Button>
                    ) : (
                      <EnrollButton
                        courseId={course.id}
                        price={course.price}
                        isLoggedIn={!!session?.user}
                      />
                    )}

                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{lessonCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Learn at your own pace</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Certificate on completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold">Course Curriculum</h2>
          <Separator className="my-6" />

          <div className="space-y-4">
            {course.chapters.map((chapter, chapterIndex) => (
              <div
                key={chapter.id}
                className="overflow-hidden rounded-lg border"
              >
                <div className="bg-muted/50 px-6 py-4">
                  <h3 className="font-semibold">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {chapter.lessons.length} lessons
                  </p>
                </div>
                <div className="divide-y">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isFree || enrollment ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                      </div>
                      {lesson.isFree && !enrollment && (
                        <Badge variant="outline" className="text-xs">
                          Free Preview
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

