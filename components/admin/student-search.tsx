"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StudentSearchProps {
  defaultValue?: string;
}

export function StudentSearch({ defaultValue }: StudentSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/admin/students?${params.toString()}`);
    });
  }

  function handleClear() {
    setValue("");
    startTransition(() => {
      router.push("/admin/students");
    });
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9"
          disabled={isPending}
        />
      </div>
      <Button type="submit" variant="secondary" disabled={isPending}>
        Search
      </Button>
      {defaultValue && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClear}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}

