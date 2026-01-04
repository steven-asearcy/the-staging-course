import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your learning dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold">The Staging Course</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back{session.user.name ? `, ${session.user.name}` : ""}!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s an overview of your learning progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">lessons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificates Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">certificates</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t enrolled in any courses yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Browse our catalog to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

