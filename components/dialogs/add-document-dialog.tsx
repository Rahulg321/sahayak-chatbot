"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Session } from "next-auth";
import { toast } from "sonner";
import axios from "axios";
import {
  newDocumentFormSchema,
  NewDocumentFormSchemaType,
} from "@/lib/schemas/new-document-form-schema";

const AddDocumentDialog = ({
  userSession,
  subjectId,
}: {
  userSession: Session;
  subjectId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewDocumentFormSchemaType>({
    resolver: zodResolver(newDocumentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      if (selectedFile.size > 5 * 1024 * 1024) {
        setFile(null);
        setError("File size must be less than 5MB.");
        return;
      }

      if (
        fileType === "application/msword" ||
        (fileName.endsWith(".doc") && !fileName.endsWith(".docx"))
      ) {
        setFile(null);
        setError(
          "We do not support .doc files. Please upload a .docx file instead."
        );
        return;
      }

      if (
        fileType === "application/pdf" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "image/jpeg" ||
        fileType === "image/png" ||
        fileType === "image/gif" ||
        fileType === "image/webp" ||
        fileType === "application/vnd.ms-excel" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload a PDF, DOCX, Excel Sheet or image file");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof newDocumentFormSchema>) => {
    startTransition(async () => {
      console.log(values);

      if (!file) {
        setError("Please select a file");
        return;
      }

      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("userId", userSession.user.id);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BOTBEE_SERVER_URL}/add-bot-resource`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${userSession.user.accessToken}`,
            },
          }
        );

        console.log("response", response);

        if (response.status !== 200) {
          throw new Error(response.data.error);
        }

        toast.success("Successful!!", {
          description: `${values.name} created successfully`,
        });

        router.refresh();
        form.reset();
        setFile(null);
        setError(null);
        setOpen(false);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to create resource. Please try again."
        );
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create resource. Please try again."
        );
        console.error(err);
      }
    });
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="size-4 mr-2" />
            Add Document
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Document</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid w-full items-center gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="file">Upload Document</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                    </div>
                    {error && (
                      <span className="text-red-500 font-semibold text-sm mt-1">
                        {error}
                      </span>
                    )}
                    {file && !error && (
                      <p className="text-sm text-green-600 mt-1">
                        <FileText className="inline mr-1 size-4" />
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="shrink-0" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddDocumentDialog;
