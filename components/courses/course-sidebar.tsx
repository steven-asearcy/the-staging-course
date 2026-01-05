"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Chapter, Course, Lesson } from "@prisma/client";

type CourseWithChapters = Course & {
  chapters: (Chapter & {
    lessons: Lesson[];
  })[];
};

interface CourseSidebarProps {
  course: CourseWithChapters;
  progress: Record<string, boolean>;
}

export function CourseSidebar({ course, progress }: CourseSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const currentLessonId = params.lessonId as string;

  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent =
    allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;

  return (
    <aside className="w-80 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h2 className="font-semibold text-lg line-clamp-2">{course.title}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium">
              {completedCount}/{allLessons.length}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {course.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chapter {chapterIndex + 1}: {chapter.title}
              </h3>
              <div className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = currentLessonId === lesson.id;
                  const isCompleted = progress[lesson.id];

                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${course.id}/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary-foreground" : "text-primary"
                          )}
                        />
                      ) : isActive ? (
                        <PlayCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="line-clamp-2">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Course Overview
        </Link>
      </div>
    </aside>
  );
}

