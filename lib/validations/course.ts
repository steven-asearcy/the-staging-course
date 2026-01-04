import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().cuid(),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  isFree: z.boolean().default(false),
  chapterId: z.string().cuid(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;

