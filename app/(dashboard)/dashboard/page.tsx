import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your learning dashboard",
};

async function getDashboardData(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          chapters: {
            where: { isPublished: true },
            include: {
              lessons: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  const courseIds = enrollments.map((e) => e.courseId);
  const allLessonIds = enrollments.flatMap((e) =>
    e.course.chapters.flatMap((c) => c.lessons.map((l) => l.id))
  );

  const completedLessons = await db.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: allLessonIds },
      isCompleted: true,
    },
  });

  const certificates = await db.certificate.count({
    where: { userId },
  });

  const courseProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const lessonIds = enrollment.course.chapters.flatMap((c) =>
        c.lessons.map((l) => l.id)
      );

      const completed = await db.lessonProgress.count({
        where: {
          userId,
          lessonId: { in: lessonIds },
          isCompleted: true,
        },
      });

      const firstLesson = enrollment.course.chapters[0]?.lessons[0];

      return {
        enrollment,
        course: enrollment.course,
        totalLessons: lessonIds.length,
        completedLessons: completed,
        progressPercent:
          lessonIds.length > 0 ? (completed / lessonIds.length) * 100 : 0,
        firstLessonId: firstLesson?.id,
      };
    })
  );

  return {
    enrollmentCount: enrollments.length,
    completedLessons,
    certificates,
    courseProgress,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="The Staging Course"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">The Staging Course</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Browse Courses
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Admin
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back{session.user.name ? `, ${session.user.name}` : ""}!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s an overview of your learning progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.enrollmentCount}</p>
              <p className="text-sm text-muted-foreground">
                {data.enrollmentCount === 1 ? "course" : "courses"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Lessons
              </CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.completedLessons}</p>
              <p className="text-sm text-muted-foreground">
                {data.completedLessons === 1 ? "lesson" : "lessons"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates Earned
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.certificates}</p>
              <p className="text-sm text-muted-foreground">
                {data.certificates === 1 ? "certificate" : "certificates"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Courses</h3>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>

          {data.courseProgress.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  You haven&apos;t enrolled in any courses yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse our catalog to get started.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.courseProgress.map(
                ({
                  course,
                  totalLessons,
                  completedLessons,
                  progressPercent,
                  firstLessonId,
                }) => (
                  <Card key={course.id} className="overflow-hidden">
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
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold line-clamp-1">
                        {course.title}
                      </h4>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {completedLessons}/{totalLessons}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      <Button className="w-full mt-4" asChild>
                        <Link
                          href={
                            firstLessonId
                              ? `/learn/${course.id}/lessons/${firstLessonId}`
                              : `/courses/${course.slug}`
                          }
                        >
                          {progressPercent === 100
                            ? "Review Course"
                            : progressPercent > 0
                              ? "Continue Learning"
                              : "Start Course"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
