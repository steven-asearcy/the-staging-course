"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Course, Enrollment } from "@prisma/client";

import { enrollUserInCourse, unenrollUserFromCourse } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type EnrollmentWithDetails = Enrollment & {
  course: Course;
  enrolledBy: { name: string | null; email: string } | null;
};

interface UserEnrollmentsProps {
  userId: string;
  enrollments: EnrollmentWithDetails[];
  availableCourses: Course[];
}

export function UserEnrollments({
  userId,
  enrollments,
  availableCourses,
}: UserEnrollmentsProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  async function handleEnroll() {
    if (!selectedCourse) return;

    setIsEnrolling(true);

    try {
      const result = await enrollUserInCourse(userId, selectedCourse);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("User enrolled successfully");
      setSelectedCourse("");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleUnenroll(courseId: string) {
    try {
      const result = await unenrollUserFromCourse(userId, courseId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("User unenrolled successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enroll in Course</CardTitle>
          <CardDescription>
            Manually enroll this user in a course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses available for enrollment. The user is either enrolled
              in all courses or there are no published courses.
            </p>
          ) : (
            <div className="flex gap-2">
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                disabled={isEnrolling}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleEnroll}
                disabled={!selectedCourse || isEnrolling}
              >
                {isEnrolling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Enroll
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Enrollments</CardTitle>
          <CardDescription>
            Courses this user has access to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No enrollments yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {enrollment.course.title}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {enrollment.enrollmentMethod}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enrolled{" "}
                      {format(new Date(enrollment.createdAt), "MMM d, yyyy")}
                      {enrollment.enrolledBy && (
                        <>
                          {" "}
                          by{" "}
                          {enrollment.enrolledBy.name ||
                            enrollment.enrolledBy.email}
                        </>
                      )}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Enrollment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this enrollment? The
                          user will lose access to this course and their
                          progress will be preserved but inaccessible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleUnenroll(enrollment.courseId)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

