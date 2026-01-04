"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { publishCourse, unpublishCourse } from "@/actions/course";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PublishButtonProps {
  courseId: string;
  isPublished: boolean;
  disabled?: boolean;
}

export function PublishButton({
  courseId,
  isPublished,
  disabled,
}: PublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handlePublish() {
    setIsLoading(true);

    try {
      const result = isPublished
        ? await unpublishCourse(courseId)
        : await publishCourse(courseId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isPublished ? "Course unpublished" : "Course published successfully!"
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (isPublished) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Unpublish
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Course</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the course from students. Existing enrollments will
              remain, but new students won&apos;t be able to find or purchase
              this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button onClick={handlePublish} disabled={disabled || isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Publish Course
    </Button>
  );
}

