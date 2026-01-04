import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Users, Search } from "lucide-react";
import { format } from "date-fns";
import { StudentSearch } from "@/components/admin/student-search";

export const metadata: Metadata = {
  title: "Students",
  description: "Manage your students",
};

async function getUsers(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  return db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const users = await getUsers(search);

  const students = users.filter((u) => u.role === "USER");
  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="mt-2 text-muted-foreground">
            Manage users and their enrollments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <StudentSearch defaultValue={search} />

      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            {search ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No users match &quot;{search}&quot;
                </p>
              </>
            ) : (
              <>
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first user to get started.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/students/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {admins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administrators</CardTitle>
                <CardDescription>
                  Users with admin access to manage the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "—"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/students/${user.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students</CardTitle>
              <CardDescription>
                {students.length} student{students.length !== 1 ? "s" : ""}{" "}
                registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No students yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "—"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user._count.enrollments} courses
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/students/${user.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

