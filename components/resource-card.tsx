"use client";

import React from "react";

import { FileText, MoreHorizontal } from "lucide-react";
import { BsFiletypePdf, BsFileImage, BsFiletypeExe } from "react-icons/bs";
import { PiFileAudioBold } from "react-icons/pi";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { deleteResource } from "@/lib/actions/delete-resource";

// Helper to get the correct file icon
const getFileIcon = (kind: string) => {
  switch (kind) {
    case "pdf":
      return (
        <BsFiletypePdf className="size-5 sm:size-4" aria-label="PDF file" />
      );
    case "doc":
    case "docx":
    case "txt":
      return (
        <FileText className="size-5 sm:size-4" aria-label="Document file" />
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "image":
      return (
        <BsFileImage className="size-5 sm:size-4" aria-label="Image file" />
      );
    case "xls":
    case "xlsx":
    case "excel":
      return (
        <BsFiletypeExe className="size-5 sm:size-4" aria-label="Excel file" />
      );
    case "mp3":
    case "audio":
      return (
        <PiFileAudioBold className="size-5 sm:size-4" aria-label="Audio file" />
      );
    default:
      return <FileText className="size-5 sm:size-4" aria-label="File" />;
  }
};

const ResourceCard = ({
  resourceId,
  resourceName,
  resourceDescription,
  resourceKind,
  gradeId,
  subjectId,
}: {
  resourceId: string;
  resourceName: string;
  resourceDescription: string | null;
  resourceKind: string;
  gradeId: string;
  subjectId: string;
}) => {
  const router = useRouter();
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 hover:bg-muted/30 group transition-colors border-b rounded-md w-full"
      tabIndex={0}
      aria-label={`Resource card for ${resourceName}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 pr-0 sm:pr-3 w-full">
        <span className="size-10 sm:size-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
          {getFileIcon(resourceKind)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base sm:text-sm font-medium text-foreground truncate">
            {resourceName}
          </p>
          {resourceDescription && (
            <span className="block text-xs text-muted-foreground truncate max-w-full">
              {resourceDescription}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 sm:size-7 opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
            aria-label="Open resource menu"
          >
            <MoreHorizontal className="size-5 sm:size-4 text-muted-foreground" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              deleteResource(resourceId, gradeId, subjectId).then((res) => {
                if (res.success) {
                  toast.success(res.message);
                } else {
                  toast.error(res.message);
                }
              });
            }}
            aria-label="Delete resource"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ResourceCard;
