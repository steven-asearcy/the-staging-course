import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export const metadata: Metadata = {
  title: "Create Course",
  description: "Create a new course",
};

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/courses">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to courses
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="mt-2 text-muted-foreground">
          Start by giving your course a title. You can add more details later.
        </p>
      </div>

      <CreateCourseForm />
    </div>
  );
}

