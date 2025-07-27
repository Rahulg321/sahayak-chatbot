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
  UsersIcon,
  LightbulbIcon,
} from "lucide-react";
import type { Suggestion } from "@/lib/db/schema";
import { toast } from "sonner";
import { getSuggestions } from "../actions";
import type { LessonPlanData } from "@/lib/types";
import { LessonPlanViewer } from "@/components/lesson-plan-viewer";

interface LessonPlanArtifactMetadata {
  suggestions: Array<Suggestion>;
  lessonPlanData?: LessonPlanData;
}

export const lessonPlanArtifact = new Artifact<
  "lesson-plan",
  LessonPlanArtifactMetadata
>({
  kind: "lesson-plan",
  description:
    "Create comprehensive lesson plans with objectives, activities, materials, and assessment strategies.",
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

    if (streamPart.type === "data-lessonPlanStructure") {
      setMetadata((metadata) => {
        return {
          ...metadata,
          lessonPlanData: streamPart.data,
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
      return <DocumentSkeleton artifactKind="lesson-plan" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    const handleSaveContent = (content: string) => {
      onSaveContent(content, true);
    };

    // Parse lesson plan data from content if not available in metadata
    let lessonPlanData = metadata?.lessonPlanData;
    if (!lessonPlanData && content) {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          lessonPlanData = parsed as LessonPlanData;
        }
      } catch (e) {
        console.error("Failed to parse lesson plan content:", e);
      }
    }

    return (
      <>
        <div className="flex flex-col py-8 md:p-20 px-4">
          <LessonPlanViewer
            content={content}
            lessonPlanData={lessonPlanData}
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
              text: "Please add more learning resources, including readings, videos, and interactive materials for each activity.",
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
              text: "Please review and optimize the time estimates for each activity to ensure realistic lesson flow.",
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
      icon: <UsersIcon />,
      description: "Add group activities",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add more collaborative and group activities to promote peer learning and engagement.",
            },
          ],
        });
      },
    },
    {
      icon: <LightbulbIcon />,
      description: "Include differentiation strategies",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please include differentiation strategies to accommodate students with different learning needs and abilities.",
            },
          ],
        });
      },
    },
    {
      icon: <CheckSquareIcon />,
      description: "Add assessment methods",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add detailed assessment methods and formative evaluation strategies for monitoring student progress.",
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
              text: "Please improve the activity instructions to be clearer, more detailed, and easier to follow for both teachers and students.",
            },
          ],
        });
      },
    },
  ],
});
