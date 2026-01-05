import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse our home staging courses",
};

async function getPublishedCourses() {
  return db.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
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
}

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

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
              className="text-sm font-medium text-foreground"
            >
              Courses
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Our Courses</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Master the art of home staging with our professional courses
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">No courses available</h2>
            <p className="mt-2 text-muted-foreground">
              Check back soon for new courses!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const lessonCount = course.chapters.reduce(
                (acc, chapter) => acc + chapter.lessons.length,
                0
              );

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="aspect-video relative bg-muted">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold group-hover:text-primary">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {course.chapters.length} chapters
                        </Badge>
                        <span>·</span>
                        <span>{lessonCount} lessons</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

