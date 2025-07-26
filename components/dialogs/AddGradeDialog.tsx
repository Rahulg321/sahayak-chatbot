"use client";

import React, { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addGradeSchema, addGradeSchemaType } from "@/lib/schemas/grade-schema";
import { Input } from "../ui/input";
import { addGrade } from "@/lib/actions/add-grade";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AddGradeDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Grade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Grade</DialogTitle>
          <DialogDescription>
            Add a new grade to your account.
          </DialogDescription>
        </DialogHeader>

        <AddGradeForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddGradeDialog;

const AddGradeForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<addGradeSchemaType>({
    resolver: zodResolver(addGradeSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: addGradeSchemaType) {
    startTransition(async () => {
      const response = await addGrade(values);
      if (response.success) {
        toast.success("Grade added successfully");
      } else {
        toast.error(response.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Grade Title" {...field} />
              </FormControl>
              <FormDescription>This is the title of the grade.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Grade Description" {...field} />
              </FormControl>
              <FormDescription>Description for the grade </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Submitting
            </div>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
};
