import { Artifact } from "@/components/create-artifact";
import { DocumentSkeleton } from "@/components/document-skeleton";
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/icons";
import type { Suggestion } from "@/lib/db/schema";
import { toast } from "sonner";
import { getSuggestions } from "../actions";

interface MindmapArtifactMetadata {
  suggestions: Array<Suggestion>;
}

// Type definition for mindmap node structure
interface MindmapNode {
  id: string;
  text: string;
  children?: MindmapNode[];
}

// Simple mindmap visualization component
const MindmapVisualizer = ({ content }: { content: string }) => {
  let mindmapData: MindmapNode | null = null;
  let parseError: string | null = null;

  try {
    if (!content || typeof content !== "string") {
      throw new Error("Invalid content: content must be a non-empty string");
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error("Empty mindmap content");
    }

    const parsed = JSON.parse(trimmedContent);

    // Validate the parsed data structure
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid mindmap data: must be an object");
    }

    // Check if it has required properties for a mindmap node
    if (typeof parsed.text !== "string" || !parsed.text.trim()) {
      throw new Error("Invalid mindmap data: missing or empty text property");
    }

    if (typeof parsed.id !== "string" || !parsed.id.trim()) {
      throw new Error("Invalid mindmap data: missing or empty id property");
    }

    mindmapData = parsed as MindmapNode;
  } catch (e) {
    console.error("Mindmap parsing error:", e);
    parseError = e instanceof Error ? e.message : "Unknown parsing error";
  }

  const renderNode = (node: MindmapNode, level: number = 0): JSX.Element => {
    console.log("node", node);
    console.log("level", level);

    return (
      <div key={node.id} className="mb-2">
        {node.text && (
          <div
            className={`p-2 rounded-lg border-2 text-sm font-medium ${
              level === 0
                ? "bg-primary/10 border-primary/30 text-primary"
                : level === 1
                  ? "bg-secondary/10 border-secondary/30 text-secondary-foreground"
                  : "bg-muted border-border text-foreground"
            }`}
            style={{
              marginLeft: level > 0 ? `${level * 24}px` : undefined, // 24px per level indentation
              transition: "margin-left 0.2s",
            }}
          >
            {node.text}
          </div>
        )}

        {node.children &&
          Array.isArray(node.children) &&
          node.children.length > 0 && (
            <div className="ml-6 mt-2 pl-4 border-l-2 border-border">
              {node.children.map((child: MindmapNode) =>
                renderNode(child, level + 1)
              )}
            </div>
          )}
      </div>
    );
  };

  // Determine what to display based on the state
  const getDisplayContent = () => {
    if (parseError) {
      return (
        <div className="flex-1 text-sm text-red-600 p-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <p className="font-medium mb-2">Error parsing mindmap</p>
            <p className="text-xs opacity-75">{parseError}</p>
          </div>
        </div>
      );
    }

    if (!mindmapData) {
      return (
        <div className="flex-1 text-sm text-muted-foreground p-6 border-2 border-dashed border-border rounded-lg bg-muted flex items-center justify-center">
          {content ? "Loading mindmap..." : "No mindmap data available"}
        </div>
      );
    }

    return <div className="flex-1">{renderNode(mindmapData)}</div>;
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Mindmap Visualization
      </h3>
      {getDisplayContent()}
    </div>
  );
};

export const mindmapArtifact = new Artifact<"mindmap", MindmapArtifactMetadata>(
  {
    kind: "mindmap",
    description:
      "Create and visualize mindmaps for brainstorming and organization.",
    initialize: async ({ documentId, setMetadata }) => {
      try {
        const suggestions = await getSuggestions({ documentId });
        setMetadata({
          suggestions: suggestions || [],
        });
      } catch (error) {
        console.error("Failed to initialize mindmap artifact:", error);
        setMetadata({
          suggestions: [],
        });
      }
    },
    onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
      if (streamPart.type === "data-suggestion") {
        setMetadata((metadata) => {
          const currentSuggestions = metadata?.suggestions || [];
          return {
            suggestions: [...currentSuggestions, streamPart.data],
          };
        });
      }

      if (streamPart.type === "data-mindmapDelta") {
        setArtifact((draftArtifact) => {
          return {
            ...draftArtifact,
            content: streamPart.data, // Replace content instead of appending
            isVisible: true, // Show immediately since we have complete JSON
            status: "streaming",
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
        return <DocumentSkeleton artifactKind="mindmap" />;
      }

      if (mode === "diff") {
        const oldContent = getDocumentContentById(currentVersionIndex - 1);
        const newContent = getDocumentContentById(currentVersionIndex);

        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Version Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Previous Version</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {oldContent || "No previous version"}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Current Version</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {newContent || "No current version"}
                </pre>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="h-full overflow-y-auto">
          <div className="">
            <MindmapVisualizer content={content || ""} />
          </div>

          {metadata?.suggestions && metadata.suggestions.length > 0 ? (
            <div className="md:hidden h-dvh w-12 shrink-0" />
          ) : null}
        </div>
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
          return currentVersionIndex === 0;
        },
      },
      {
        icon: <UndoIcon size={18} />,
        description: "View Previous version",
        onClick: ({ handleVersionChange }) => {
          handleVersionChange("prev");
        },
        isDisabled: ({ currentVersionIndex }) => {
          return currentVersionIndex === 0;
        },
      },
      {
        icon: <RedoIcon size={18} />,
        description: "View Next version",
        onClick: ({ handleVersionChange }) => {
          handleVersionChange("next");
        },
        isDisabled: ({ isCurrentVersion }) => {
          return isCurrentVersion;
        },
      },
      {
        icon: <CopyIcon size={18} />,
        description: "Copy to clipboard",
        onClick: ({ content }) => {
          try {
            if (!content || typeof content !== "string") {
              toast.error("No content to copy");
              return;
            }

            navigator.clipboard
              .writeText(content)
              .then(() => {
                toast.success("Copied to clipboard!");
              })
              .catch((error) => {
                console.error("Failed to copy to clipboard:", error);
                toast.error("Failed to copy to clipboard");
              });
          } catch (error) {
            console.error("Clipboard operation failed:", error);
            toast.error("Failed to copy to clipboard");
          }
        },
      },
    ],
    toolbar: [
      {
        icon: <PenIcon />,
        description: "Expand mindmap",
        onClick: ({ sendMessage }) => {
          sendMessage({
            role: "user",
            parts: [
              {
                type: "text",
                text: "Please expand this mindmap with more detailed branches and sub-topics.",
              },
            ],
          });
        },
      },
      {
        icon: <MessageIcon />,
        description: "Request suggestions",
        onClick: ({ sendMessage }) => {
          sendMessage({
            role: "user",
            parts: [
              {
                type: "text",
                text: "Please suggest additional topics or connections that could be added to this mindmap.",
              },
            ],
          });
        },
      },
    ],
  }
);
