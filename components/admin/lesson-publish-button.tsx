"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { publishLesson, unpublishLesson } from "@/actions/lesson";
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

interface LessonPublishButtonProps {
  lessonId: string;
  isPublished: boolean;
  disabled?: boolean;
}

export function LessonPublishButton({
  lessonId,
  isPublished,
  disabled,
}: LessonPublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handlePublish() {
    setIsLoading(true);

    try {
      const result = isPublished
        ? await unpublishLesson(lessonId)
        : await publishLesson(lessonId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isPublished ? "Lesson unpublished" : "Lesson published successfully!"
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
            <AlertDialogTitle>Unpublish Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the lesson from students. They won&apos;t be able
              to view this lesson until you publish it again.
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
      Publish Lesson
    </Button>
  );
}

