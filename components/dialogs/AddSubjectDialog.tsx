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
import {
  addSubjectSchema,
  addSubjectSchemaType,
} from "@/lib/schemas/subject-schema";
import { addSubject } from "@/lib/actions/add-subject";

const AddSubjectDialog = ({ gradeId }: { gradeId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Subject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogDescription>Add a new subject</DialogDescription>
        </DialogHeader>

        <AddSubjectForm gradeId={gradeId} />
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectDialog;

const AddSubjectForm = ({ gradeId }: { gradeId: string }) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<addSubjectSchemaType>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: addSubjectSchemaType) {
    startTransition(async () => {
      const response = await addSubject(values, gradeId);
      if (response.success) {
        toast.success("Subject added successfully");
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="Grade Title" {...field} />
              </FormControl>
              <FormDescription>Subject Name</FormDescription>
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
                <Input placeholder="Grade Title" {...field} />
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
