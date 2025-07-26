"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RECORDING_TYPES } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";

export function TransformDropdown({
  onTransform,
  isStreaming = false,
}: {
  onTransform: (type: string) => void;
  isStreaming?: boolean;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={isStreaming}>
        <button
          className={`w-full md:max-w-[322px] max-w-md py-2 rounded-lg font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors
            ${
              isStreaming
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }
          `}
        >
          <SparklesIcon className="size-5 min-w-5 min-h-5" />
          <span>{isStreaming ? "Streaming ..." : "Transform"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="!p-0">
        {RECORDING_TYPES.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onSelect={() => onTransform(type.value)}
            className="flex items-center gap-2 cursor-pointer h-[51px] p-3 border-b hover:bg-muted min-w-[322px] max-w-full"
          >
            <SparklesIcon className="size-5 min-w-5 min-h-5" />
            <span>{type.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
