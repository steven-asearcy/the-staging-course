"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Loader2,
  GripVertical,
  Trash2,
  FileText,
  Video,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { Lesson, Resource } from "@prisma/client";

import { createLesson, deleteLesson } from "@/actions/lesson";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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

type LessonWithResources = Lesson & { resources: Resource[] };

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

interface LessonsListProps {
  chapterId: string;
  lessons: LessonWithResources[];
  courseId: string;
}

export function LessonsList({ chapterId, lessons, courseId }: LessonsListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await createLesson({
        title: data.title,
        chapterId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Lesson created");
      form.reset();
      setIsCreating(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(lessonId: string) {
    try {
      const result = await deleteLesson(lessonId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Lesson deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-2">
      {lessons.length === 0 && !isCreating ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          No lessons yet
        </p>
      ) : (
        <div className="space-y-1">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-2 rounded-md bg-accent/50 px-3 py-2"
            >
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
              {lesson.videoUrl ? (
                <Video className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <Link
                href={`/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`}
                className="flex-1 text-sm font-medium hover:underline"
              >
                {lesson.title}
              </Link>
              <div className="flex items-center gap-1">
                {lesson.isFree && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    Free
                  </Badge>
                )}
                {!lesson.isFree && !lesson.isPublished && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                <Badge
                  variant={lesson.isPublished ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lesson.isPublished ? "Published" : "Draft"}
                </Badge>
                {lesson.resources.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {lesson.resources.length} resources
                  </span>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this lesson and all its
                      resources. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(lesson.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {isCreating ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Lesson title"
                      disabled={isLoading}
                      className="h-8"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsCreating(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
          </form>
        </Form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lesson
        </Button>
      )}
    </div>
  );
}

