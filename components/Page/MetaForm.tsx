"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageMetaInput, pageMetaSchema } from "@/lib/schema/page-meta";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MetaFormProps {
  initialData?: PageMetaInput;
  onSubmit: (data: PageMetaInput) => void | Promise<void>;
}

export function MetaForm({ initialData, onSubmit }: MetaFormProps) {
  const form = useForm<PageMetaInput>({
    resolver: zodResolver(pageMetaSchema),
    defaultValues: initialData || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* General SEO */}
        <FormField
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter meta title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter meta description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Comma-separated keywords" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canonicalPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical Path</FormLabel>
              <FormControl>
                <Input {...field} placeholder="/about" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Open Graph */}
        <FormField
          control={form.control}
          name="ogTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG Image URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Twitter */}
        <FormField
          control={form.control}
          name="twitterTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="twitterDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="twitterImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Image URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Robots */}
        <FormField
          control={form.control}
          name="robots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Robots</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select robots setting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">index, follow</SelectItem>
                    <SelectItem value="noindex, nofollow">
                      noindex, nofollow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Metadata</Button>
      </form>
    </Form>
  );
}
