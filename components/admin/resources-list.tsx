"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Trash2, FileText, Link as LinkIcon, Download } from "lucide-react";
import { toast } from "sonner";
import type { Resource, ResourceType } from "@prisma/client";

import { createResource, deleteResource } from "@/actions/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const resourceTypes: { value: ResourceType; label: string; icon: typeof FileText }[] = [
  { value: "PDF", label: "PDF Document", icon: FileText },
  { value: "LINK", label: "External Link", icon: LinkIcon },
  { value: "DOWNLOAD", label: "Downloadable File", icon: Download },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["PDF", "LINK", "DOWNLOAD"]),
});

interface ResourcesListProps {
  lessonId: string;
  resources: Resource[];
}

export function ResourcesList({ lessonId, resources }: ResourcesListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "PDF",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await createResource({
        title: data.title,
        url: data.url,
        type: data.type,
        lessonId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Resource added");
      form.reset();
      setIsCreating(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(resourceId: string) {
    try {
      const result = await deleteResource(resourceId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Resource deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  function getResourceIcon(type: ResourceType) {
    const resourceType = resourceTypes.find((t) => t.value === type);
    const Icon = resourceType?.icon || FileText;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <CardDescription>
          Add downloadable materials and links for this lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.length === 0 && !isCreating ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No resources yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-3 rounded-md border bg-card p-3"
              >
                {getResourceIcon(resource.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{resource.title}</p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline truncate block"
                  >
                    {resource.url}
                  </a>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this resource?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(resource.id)}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Resource title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/file.pdf"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Add Resource
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
              </div>
            </form>
          </Form>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

