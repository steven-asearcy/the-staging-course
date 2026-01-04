"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { Chapter, Lesson, Resource } from "@prisma/client";

import { createChapter, deleteChapter, updateChapter } from "@/actions/chapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { LessonsList } from "@/components/admin/lessons-list";

type ChapterWithLessons = Chapter & {
  lessons: (Lesson & { resources: Resource[] })[];
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

interface ChaptersListProps {
  courseId: string;
  chapters: ChapterWithLessons[];
}

export function ChaptersList({ courseId, chapters }: ChaptersListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  function toggleChapter(chapterId: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await createChapter({
        title: data.title,
        courseId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Chapter created");
      form.reset();
      setIsCreating(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(chapterId: string, title: string) {
    setIsLoading(true);

    try {
      const result = await updateChapter(chapterId, { title });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Chapter updated");
      setEditingId(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(chapterId: string) {
    try {
      const result = await deleteChapter(chapterId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Chapter deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapters</CardTitle>
        <CardDescription>
          Organize your course content into chapters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chapters.length === 0 && !isCreating ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No chapters yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <Collapsible
                key={chapter.id}
                open={openChapters.has(chapter.id)}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <div className="rounded-lg border bg-card">
                  <div className="flex items-center gap-2 p-3">
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                    <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
                      {openChapters.has(chapter.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {editingId === chapter.id ? (
                        <form
                          className="flex flex-1 gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUpdate(
                              chapter.id,
                              editForm.getValues("title")
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            defaultValue={chapter.title}
                            {...editForm.register("title")}
                            className="h-7"
                            autoFocus
                          />
                          <Button type="submit" size="sm" disabled={isLoading}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <span className="flex-1 font-medium">
                          {chapter.title}
                        </span>
                      )}
                    </CollapsibleTrigger>
                    <Badge
                      variant={chapter.isPublished ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {chapter.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {chapter.lessons.length} lessons
                    </span>
                    {editingId !== chapter.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            editForm.setValue("title", chapter.title);
                            setEditingId(chapter.id);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the chapter and all its lessons.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(chapter.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                  <CollapsibleContent>
                    <div className="border-t px-3 py-3">
                      <LessonsList
                        chapterId={chapter.id}
                        lessons={chapter.lessons}
                        courseId={courseId}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}

        {isCreating ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Chapter title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                type="button"
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
            variant="outline"
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

