import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "@/components/admin/user-profile-form";
import { UserEnrollments } from "@/components/admin/user-enrollments";
import { UserPasswordReset } from "@/components/admin/user-password-reset";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "User Details",
  description: "View and edit user details",
};

async function getUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: true,
          enrolledBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          progress: { where: { isCompleted: true } },
          certificates: true,
        },
      },
    },
  });
}

async function getAvailableCourses(userId: string) {
  const enrolledCourseIds = await db.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const ids = enrolledCourseIds.map((e) => e.courseId);

  return db.course.findMany({
    where: {
      id: { notIn: ids },
      isPublished: true,
    },
    orderBy: { title: "asc" },
  });
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [user, availableCourses] = await Promise.all([
    getUser(userId),
    getAvailableCourses(userId),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/students">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to students
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {user.name || user.email}
            </h1>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role === "ADMIN" ? "Administrator" : "Student"}
            </Badge>
            {!user.isActive && (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            Joined {format(new Date(user.createdAt), "MMMM d, yyyy")} ·{" "}
            {user.enrollments.length} enrollments ·{" "}
            {user._count.progress} lessons completed ·{" "}
            {user._count.certificates} certificates
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({user.enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfileForm user={user} />
        </TabsContent>

        <TabsContent value="enrollments">
          <UserEnrollments
            userId={user.id}
            enrollments={user.enrollments}
            availableCourses={availableCourses}
          />
        </TabsContent>

        <TabsContent value="security">
          <UserPasswordReset userId={user.id} userEmail={user.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

