import { Artifact } from "@/components/create-artifact";
import { DiffView } from "@/components/diffview";
import { DocumentSkeleton } from "@/components/document-skeleton";
import {
  CopyIcon,
  RedoIcon,
  UndoIcon,
  BookOpenIcon,
  TargetIcon,
  FileIcon,
  ClockIcon,
  CheckSquareIcon,
} from "lucide-react";
import type { Suggestion } from "@/lib/db/schema";
import { toast } from "sonner";
import { getSuggestions } from "../actions";
import type { HomeworkData } from "@/lib/types";
import { HomeworkViewer } from "@/components/homework-viewer";

interface HomeworkArtifactMetadata {
  suggestions: Array<Suggestion>;
  homeworkData?: HomeworkData;
}

export const homeworkArtifact = new Artifact<
  "homework",
  HomeworkArtifactMetadata
>({
  kind: "homework",
  description:
    "Create structured homework assignments with tasks, instructions, and assessment criteria.",
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "data-suggestion") {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === "data-homeworkStructure") {
      setMetadata((metadata) => {
        return {
          ...metadata,
          homeworkData: streamPart.data,
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="homework" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    const handleSaveContent = (content: string) => {
      onSaveContent(content, true);
    };

    return (
      <>
        <div className="flex flex-col py-8 md:p-20 px-4">
          <HomeworkViewer
            content={content}
            homeworkData={metadata?.homeworkData}
            suggestions={metadata ? metadata.suggestions : []}
            isCurrentVersion={isCurrentVersion}
            currentVersionIndex={currentVersionIndex}
            status={status}
            onSaveContent={handleSaveContent}
          />

          {metadata?.suggestions && metadata.suggestions.length > 0 ? (
            <div className="md:hidden h-dvh w-12 shrink-0" />
          ) : null}
        </div>
      </>
    );
  },
  actions: [
    {
      icon: <ClockIcon />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("toggle");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <BookOpenIcon />,
      description: "Add learning resources",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add more learning resources, including readings, videos, and interactive materials for each task.",
            },
          ],
        });
      },
    },
    {
      icon: <ClockIcon />,
      description: "Optimize time estimates",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please review and optimize the time estimates for each task to ensure realistic completion times.",
            },
          ],
        });
      },
    },
    {
      icon: <TargetIcon />,
      description: "Enhance learning objectives",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please enhance the learning objectives to be more specific, measurable, and aligned with educational standards.",
            },
          ],
        });
      },
    },
    {
      icon: <CheckSquareIcon />,
      description: "Add assessment criteria",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add detailed assessment criteria and rubrics for evaluating student work.",
            },
          ],
        });
      },
    },
    {
      icon: <FileIcon />,
      description: "Improve instructions",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please improve the task instructions to be clearer, more detailed, and easier to follow.",
            },
          ],
        });
      },
    },
  ],
});
