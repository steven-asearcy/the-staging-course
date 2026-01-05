"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { enrollInCourse } from "@/actions/enrollment";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  courseId: string;
  price: number;
  isLoggedIn: boolean;
}

export function EnrollButton({ courseId, price, isLoggedIn }: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (price > 0) {
      toast.info("Payments coming soon! For now, contact the instructor.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await enrollInCourse(courseId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Enrolled successfully!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : null}
      {price > 0 ? `Enroll for ${formatPrice(price)}` : "Enroll for Free"}
    </Button>
  );
}

