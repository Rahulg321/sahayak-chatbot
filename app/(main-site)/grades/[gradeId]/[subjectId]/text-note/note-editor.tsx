"use client";

import { useState, useRef, useTransition } from "react";
import { addTextNote } from "@/lib/actions/add-text-note";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function TextEditor({
  gradeId,
  subjectId,
}: {
  gradeId: string;
  subjectId: string;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      if (!content.trim()) return;

      try {
        const response = await addTextNote(content, title, gradeId, subjectId);
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Failed to save:", error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8 flex flex-col gap-4">
        <div className="mb-6">
          <div className="mb-4">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="mt-1 text-lg font-medium "
              disabled={isPending}
            />
          </div>
        </div>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="min-h-[50vh] resize-none focus-visible:ring-0 text-lg leading-relaxed "
          disabled={isPending}
        />

        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Submit Note"}
        </Button>
      </div>
    </div>
  );
}
