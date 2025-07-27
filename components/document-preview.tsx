"use client";

import {
  memo,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { ArtifactKind, UIArtifact } from "./artifact";
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from "./icons";
import { cn, fetcher } from "@/lib/utils";
import type { Document } from "@/lib/db/schema";
import { InlineDocumentSkeleton } from "./document-skeleton";
import useSWR from "swr";
import { Editor } from "./text-editor";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { CodeEditor } from "./code-editor";
import { useArtifact } from "@/hooks/use-artifact";
import equal from "fast-deep-equal";
import { SpreadsheetEditor } from "./sheet-editor";
import { ImageEditor } from "./image-editor";
import { CurriculumViewer } from "./curriculum-viewer";
import { HomeworkViewer } from "./homework-viewer";
import { LessonPlanViewer } from "./lesson-plan-viewer";

// Simple mindmap preview component
const MindmapPreview = ({ content }: { content: string }) => {
  let mindmapData;

  try {
    if (content?.trim()) mindmapData = JSON.parse(content);
    else throw new Error("Empty mindmap content");
  } catch (e) {
    console.error(e);
  }

  const renderNode = (node: any, level: number = 0) => (
    <div key={node.id} className="mb-1">
      {node.text && (
        <div
          className={`p-1 rounded border text-xs font-medium ${
            level === 0
              ? "bg-primary/10 border-primary/30 text-primary"
              : level === 1
                ? "bg-secondary/10 border-secondary/30 text-secondary-foreground"
                : "bg-muted border-border text-foreground"
          }`}
        >
          {node.text}
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className="ml-3 mt-1 pl-2 border-l border-border">
          {node.children.map((child: any) => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-2 h-full">
      {mindmapData ? (
        <div>{renderNode(mindmapData)}</div>
      ) : (
        <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded bg-muted">
          {content ? "Loading mindmap..." : "No mindmap data available"}
        </div>
      )}
    </div>
  );
};

// Simple curriculum preview component
const CurriculumPreview = ({ content }: { content: string }) => {
  let curriculumData;

  try {
    if (content?.trim()) curriculumData = JSON.parse(content);
    else throw new Error("Empty curriculum content");
  } catch (e) {
    console.error(e);
  }

  if (!curriculumData || !curriculumData.title) {
    return (
      <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded bg-muted">
        {content ? "Loading curriculum..." : "No curriculum data available"}
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-primary">
            {curriculumData.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {curriculumData.description}
          </p>
        </div>

        {curriculumData.units && curriculumData.units.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">
              Units ({curriculumData.units.length})
            </h4>
            <div className="space-y-1">
              {curriculumData.units.slice(0, 3).map((unit: any) => (
                <div
                  key={unit.id}
                  className="text-xs p-2 bg-muted/50 rounded border"
                >
                  <div className="font-medium">
                    Unit {unit.order}: {unit.title}
                  </div>
                  {unit.topics && (
                    <div className="text-muted-foreground mt-1">
                      {unit.topics.length} topics
                    </div>
                  )}
                </div>
              ))}
              {curriculumData.units.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{curriculumData.units.length - 3} more units
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple homework preview component
const HomeworkPreview = ({ content }: { content: string }) => {
  let homeworkData;

  try {
    if (content?.trim()) homeworkData = JSON.parse(content);
    else throw new Error("Empty homework content");
  } catch (e) {
    console.error(e);
  }

  if (!homeworkData || !homeworkData.title) {
    return (
      <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded bg-muted">
        {content ? "Loading homework..." : "No homework data available"}
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-primary">
            {homeworkData.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {homeworkData.description}
          </p>
        </div>

        {homeworkData.tasks && homeworkData.tasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">
              Tasks ({homeworkData.tasks.length})
            </h4>
            <div className="space-y-1">
              {homeworkData.tasks.slice(0, 3).map((task: any) => (
                <div
                  key={task.id}
                  className="text-xs p-2 bg-muted/50 rounded border"
                >
                  <div className="font-medium">
                    Task {task.order}: {task.title}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {task.estimatedTime} min • {task.type}
                  </div>
                </div>
              ))}
              {homeworkData.tasks.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{homeworkData.tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple lesson plan preview component
const LessonPlanPreview = ({ content }: { content: string }) => {
  let lessonPlanData;

  try {
    if (content?.trim()) lessonPlanData = JSON.parse(content);
    else throw new Error("Empty lesson plan content");
  } catch (e) {
    console.error(e);
  }

  if (!lessonPlanData || !lessonPlanData.title) {
    return (
      <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded bg-muted">
        {content ? "Loading lesson plan..." : "No lesson plan data available"}
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-primary">
            {lessonPlanData.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lessonPlanData.description}
          </p>
        </div>

        {lessonPlanData.activities && lessonPlanData.activities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">
              Activities ({lessonPlanData.activities.length})
            </h4>
            <div className="space-y-1">
              {lessonPlanData.activities.slice(0, 3).map((activity: any) => (
                <div
                  key={activity.id}
                  className="text-xs p-2 bg-muted/50 rounded border"
                >
                  <div className="font-medium">
                    Activity {activity.order}: {activity.title}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {activity.estimatedTime} min • {activity.type}
                  </div>
                </div>
              ))}
              {lessonPlanData.activities.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{lessonPlanData.activities.length - 3} more activities
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title, kind: args.kind }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === "streaming"
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: "noop",
        }
      : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setArtifact={setArtifact}
      />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === "streaming"}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === "image" ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : artifactKind === "mindmap" ? (
      <div className="overflow-y-scroll border rounded-b-2xl p-2 bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full rounded" />
      </div>
    ) : artifactKind === "curriculum" ? (
      <div className="overflow-y-scroll border rounded-b-2xl p-2 bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full rounded" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact) =>
        artifact.status === "streaming"
          ? { ...artifact, isVisible: true }
          : {
              ...artifact,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            }
      );
    },
    [setArtifact, result]
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-4 flex justify-end items-center">
        <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === "image" ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    "h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700",
    {
      "p-4 sm:px-14 sm:py-16": document.kind === "text",
      "p-0": document.kind === "code",
      "p-2":
        document.kind === "mindmap" ||
        document.kind === "curriculum" ||
        document.kind === "homework" ||
        document.kind === "lesson-plan",
    }
  );

  const commonProps = {
    content: document.content ?? "",
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === "text" ? (
        <Editor {...commonProps} onSaveContent={() => {}} />
      ) : document.kind === "code" ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={() => {}} />
          </div>
        </div>
      ) : document.kind === "sheet" ? (
        <div className="flex flex-1 relative size-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === "image" ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ""}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={artifact.status}
          isInline={true}
        />
      ) : document.kind === "mindmap" ? (
        <MindmapPreview content={document.content ?? ""} />
      ) : document.kind === "curriculum" ? (
        <CurriculumPreview content={document.content ?? ""} />
      ) : document.kind === "homework" ? (
        <HomeworkPreview content={document.content ?? ""} />
      ) : document.kind === "lesson-plan" ? (
        <LessonPlanPreview content={document.content ?? ""} />
      ) : null}
    </div>
  );
};
