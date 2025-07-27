import { Artifact } from "@/components/create-artifact";
import { DiffView } from "@/components/diffview";
import { DocumentSkeleton } from "@/components/document-skeleton";
import { CurriculumViewer } from "@/components/curriculum-viewer";
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
  BookOpenIcon,
  CalendarIcon,
  TargetIcon,
} from "@/components/icons";
import type { Suggestion } from "@/lib/db/schema";
import { toast } from "sonner";
import { getSuggestions } from "../actions";

interface CurriculumUnit {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: CurriculumTopic[];
}

interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  order: number;
  learningObjectives: string[];
  estimatedHours: number;
  resources: CurriculumResource[];
}

interface CurriculumResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
}

interface CurriculumData {
  title: string;
  description: string;
  totalEstimatedHours: number;
  prerequisites: string[];
  assessmentMethods: string[];
  units: CurriculumUnit[];
}

interface CurriculumArtifactMetadata {
  suggestions: Array<Suggestion>;
  curriculumData?: CurriculumData;
}

export const curriculumArtifact = new Artifact<
  "curriculum",
  CurriculumArtifactMetadata
>({
  kind: "curriculum",
  description:
    "Create structured curriculum plans with units, topics, and learning resources.",
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

    if (streamPart.type === "data-curriculumStructure") {
      setMetadata((metadata) => {
        return {
          ...metadata,
          curriculumData: streamPart.data,
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
      return <DocumentSkeleton artifactKind="curriculum" />;
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
        <div className="flex flex-col py-8 px-4">
          <CurriculumViewer
            content={content}
            curriculumData={metadata?.curriculumData}
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
      icon: <ClockRewind size={18} />,
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
              text: "Please add more learning resources, including readings, videos, and interactive materials for each topic.",
            },
          ],
        });
      },
    },
    {
      icon: <CalendarIcon />,
      description: "Optimize timeline",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please review and optimize the timeline and estimated hours for each topic to ensure realistic pacing.",
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
  ],
});
