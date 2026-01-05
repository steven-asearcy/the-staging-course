"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toggleLessonProgress } from "@/actions/progress";
import { Button } from "@/components/ui/button";

interface LessonCompleteButtonProps {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  nextLessonId?: string;
}

export function LessonCompleteButton({
  lessonId,
  courseId,
  isCompleted,
  nextLessonId,
}: LessonCompleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);

    try {
      const result = await toggleLessonProgress(lessonId, !isCompleted);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!isCompleted && nextLessonId) {
        toast.success("Lesson completed! Moving to next lesson...");
        router.push(`/learn/${courseId}/lessons/${nextLessonId}`);
      } else if (!isCompleted) {
        toast.success("Lesson completed!");
      } else {
        toast.success("Lesson marked as incomplete");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isCompleted ? "outline" : "default"}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <Circle className="mr-2 h-4 w-4" />
      )}
      {isCompleted ? "Completed" : "Mark as Complete"}
    </Button>
  );
}

