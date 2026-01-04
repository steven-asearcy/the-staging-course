import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses",
  description: "Manage your courses",
};

async function getCourses() {
  return db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating your first course.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/courses/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const lessonCount = course.chapters.reduce(
              (acc, chapter) => acc + chapter.lessons.length,
              0
            );

            return (
              <Link key={course.id} href={`/admin/courses/${course.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-1">
                        {course.title}
                      </CardTitle>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {course.chapters.length} chapters · {lessonCount} lessons
                      </span>
                      <span className="font-medium text-foreground">
                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {course._count.enrollments} enrollments
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

