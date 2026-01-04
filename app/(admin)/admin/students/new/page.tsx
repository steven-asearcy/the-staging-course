import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "@/components/admin/create-user-form";

export const metadata: Metadata = {
  title: "Add User",
  description: "Create a new user",
};

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/students">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to students
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add User</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new user account
        </p>
      </div>

      <CreateUserForm />
    </div>
  );
}

