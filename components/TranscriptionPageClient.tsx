"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { RECORDING_TYPES } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { LoadingSection } from "./LoadingSection";
import { CustomMarkdown } from "./CustomMarkdown";
import { AutosizeTextarea } from "./ui/AutosizeTextrea";
import { TransformDropdown } from "./TransformDropdown";
import { CopyIcon, PlusIcon } from "lucide-react";

const DELAY_SAVE = 10000;

const TranscriptionPageClient = ({
  noteId,
  gradeId,
  subjectId,
}: {
  noteId: string;
  gradeId: string;
  subjectId: string;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: note,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["note-with-audio-tracks", noteId],
    queryFn: async () => {
      const response = await fetch(`/api/note-with-tracks`, {
        method: "POST",
        body: JSON.stringify({ noteId }),
      });

      console.log(response);

      const data = await response.json();
      console.log(data);
      return data.note;
    },
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const titleDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [editableTranscription, setEditableTranscription] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedTransformationId, setSelectedTransformationId] = useState<
    string | null
  >(null);

  const titleMutation = useMutation({
    mutationFn: (data: { id: string; title: string }) => {
      return fetch("/api/note/title", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["note-with-audio-tracks"] });
    },
  });

  const getAllTransformations = () => {
    return note?.transformations || [];
  };

  // Helper: get display name for a transformation type
  const getTypeDisplayName = (typeName: string) => {
    const found = RECORDING_TYPES.find((t) => t.value === typeName);
    return found ? found.name : typeName;
  };

  // Helper: group and label transformations by type (with display names)
  const getLabeledTransformations = () => {
    const all = getAllTransformations();
    const grouped: Record<string, any[]> = {};
    (Array.isArray(all) ? all : [all]).forEach((t) => {
      if (!grouped[t.typeName]) grouped[t.typeName] = [];
      grouped[t.typeName].push(t);
    });
    // Sort each group by createdAt (oldest first)
    Object.values(grouped).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    // Assign labels using display name
    const labeled: any[] = [];
    Object.entries(grouped).forEach(([type, arr]) => {
      const displayName = getTypeDisplayName(type);
      arr.forEach((t, idx) => {
        labeled.push({
          ...t,
          label: arr.length > 1 ? `${displayName} ${idx + 1}` : displayName,
        });
      });
    });
    return labeled;
  };

  useEffect(() => {
    if (note?.content) {
      setEditableTranscription(note.content);
    }
    if (note?.title) {
      setEditableTitle(note.title);
    }
    // Default selection: base
    if (!selectedTransformationId) setSelectedTransformationId("base");
  }, [note?.content, note?.title]);

  // When a transformation is selected, update the text shown
  const getSelectedTransformation = () => {
    if (selectedTransformationId === "base") return note?.content || "";
    const all = getAllTransformations();
    const t = (Array.isArray(all) ? all : [all]).find(
      (t: any) => t.id === selectedTransformationId
    );
    return t ? t.text : note?.content || "";
  };

  const handleTransform = async (typeName: string) => {
    setIsStreaming(true);
    setStreamingText("");
    let newId: string | null = null;
    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        body: JSON.stringify({ noteId, typeName }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let buffer = "";
      let gotId = false;
      let text = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        // First line is the id JSON
        if (!gotId) {
          const newlineIdx = buffer.indexOf("\n");
          if (newlineIdx !== -1) {
            const idLine = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            try {
              const parsed = JSON.parse(idLine);
              newId = parsed.id;
              setSelectedTransformationId(newId);
            } catch (e) {
              console.error(e);
            }
            gotId = true;
          } else {
            continue;
          }
        }
        // The rest is streamed text
        text += buffer;
        setStreamingText(text);
        buffer = "";
      }
      setIsStreaming(false);
      setStreamingText("");
      // Refetch to get the final transformation from DB
      await refetch();
    } catch (err) {
      setIsStreaming(false);
      setStreamingText("");
      toast.error("Failed to generate transformation");
    }
  };

  const renderTranscription = () => {
    if (isStreaming) {
      return (
        <>
          {streamingText.length === 0 && <LoadingSection />}
          <div className="mt-2 whitespace-pre-line rounded p-2 min-h-[120px] w-full bg-white text-slate-800 flex flex-col gap-0.5 animate-pulse">
            <CustomMarkdown>{streamingText}</CustomMarkdown>
          </div>
        </>
      );
    }
    if (selectedTransformationId === "base") {
      return (
        <AutosizeTextarea
          className="whitespace-pre-line rounded p-2 min-h-[120px] w-full focus:outline-none resize-vertical"
          value={editableTranscription}
          onChange={(e) => {
            const value = e.target.value;
            setEditableTranscription(value);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
              titleMutation.mutate(
                { id: noteId, title: value },
                {
                  onSuccess: () => {
                    toast.success("Transcription saved!", {
                      id: "transcription-save",
                    });
                  },
                  onError: () => {
                    toast.error("Failed to save transcription.", {
                      id: "transcription-save",
                    });
                  },
                }
              );
            }, DELAY_SAVE); // Increased debounce to 4 seconds
          }}
          spellCheck={true}
          aria-label="Edit transcription"
          disabled={titleMutation.status === "pending"}
        />
      );
    }
    // Find transformation
    const all = getAllTransformations();
    const t = all.find((t: any) => t.id === selectedTransformationId);
    if (!t) return null;
    if (t.isGenerating) {
      return <LoadingSection />;
    }
    return (
      <div className="whitespace-pre-line rounded p-2 min-h-[120px] w-full bg-white text-slate-800 flex flex-col gap-0.5">
        <CustomMarkdown>{t.text}</CustomMarkdown>
      </div>
    );
  };

  // Dropdown for selecting transformation
  const labeledTransformations = getLabeledTransformations();
  const isCurrentGenerating =
    selectedTransformationId !== "base" &&
    labeledTransformations.find((t) => t.id === selectedTransformationId)
      ?.isGenerating;

  // Polling logic: refetch if selected transformation is generating
  useEffect(() => {
    let attempts = 0;
    let timer: NodeJS.Timeout | null = null;
    const poll = async () => {
      const t = labeledTransformations.find(
        (t) => t.id === selectedTransformationId
      );
      if (
        selectedTransformationId !== "base" &&
        t &&
        t.isGenerating &&
        attempts < 5
      ) {
        attempts++;
        await refetch();
        timer = setTimeout(poll, 5000);
      }
    };
    // Start polling if needed
    const t = labeledTransformations.find(
      (t) => t.id === selectedTransformationId
    );
    if (selectedTransformationId !== "base" && t && t.isGenerating) {
      poll();
    }
    // Cleanup on unmount or when dependencies change
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [selectedTransformationId, labeledTransformations]);

  if (error || (!note && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Note not found</h1>
          <button
            onClick={() => router.push("/notes")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-[calc(100vh-60px)] ">
        <header className="border-b  px-6 py-4 flex items-center justify-between">
          <div className="mx-auto max-w-[688px] w-full flex items-center gap-4">
            <input
              className="text-xl font-semibold bg-transparent border-none outline-none w-full"
              value={editableTitle}
              onChange={(e) => {
                const value = e.target.value;
                setEditableTitle(value);
                if (titleDebounceTimeout.current)
                  clearTimeout(titleDebounceTimeout.current);
                titleDebounceTimeout.current = setTimeout(() => {
                  titleMutation.mutate(
                    { id: noteId, title: value },
                    {
                      onSuccess: () => {
                        toast.success("Title saved!", { id: "title-save" });
                      },
                      onError: () => {
                        toast.error("Failed to save title.", {
                          id: "title-save",
                        });
                      },
                    }
                  );
                }, DELAY_SAVE); // Increased debounce to 4 seconds
              }}
              aria-label="Edit title"
              spellCheck={true}
              disabled={titleMutation.status === "pending"}
            />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild disabled={isStreaming || isLoading}>
                <button
                  className={`flex justify-between items-center relative overflow-hidden gap-2 px-3 py-[5px] rounded-lg border-[0.5px] min-h-[34px] min-w-[100px] max-w-[120px] w-full text-sm font-medium ${
                    isStreaming || isLoading
                      ? "bg-muted    text-muted-foreground"
                      : ""
                  }`}
                  disabled={isStreaming || isLoading}
                  type="button"
                >
                  <span className="text-sm text-left w-full">
                    {isStreaming || isLoading
                      ? "Generating..."
                      : (() => {
                          if (selectedTransformationId === "base")
                            return "Transcript";
                          const t = labeledTransformations.find(
                            (t) => t.id === selectedTransformationId
                          );
                          return t ? t.label : "Transcript";
                        })()}
                  </span>
                  <span className="ml-2 flex items-center">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.70628 2.92973C8.94592 3.16937 8.94592 3.5579 8.70628 3.79754L5.43355 7.07027C5.19391 7.30991 4.80538 7.30991 4.56574 7.07027L1.29301 3.79754C1.05337 3.5579 1.05337 3.16937 1.29301 2.92973C1.53265 2.69009 1.92118 2.69009 2.16082 2.92973L4.99964 5.76855L7.83847 2.92973C8.07811 2.69009 8.46664 2.69009 8.70628 2.92973Z"
                        fill="#D1D5DC"
                      />
                    </svg>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                <DropdownMenuItem
                  onSelect={() => setSelectedTransformationId("base")}
                  disabled={isStreaming || isCurrentGenerating}
                  className="text-sm"
                >
                  Transcript
                </DropdownMenuItem>
                {labeledTransformations.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onSelect={() => setSelectedTransformationId(t.id)}
                    disabled={isStreaming || isCurrentGenerating}
                    className="text-sm flex items-center gap-2"
                  >
                    {t.label}
                    {t.isGenerating && (
                      <span className="ml-2 animate-pulse text-xs text-muted-foreground">
                        ...
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="py-8 mx-auto max-w-[688px] w-full">
          {isLoading ? (
            <div className="px-8">
              <LoadingSection />
            </div>
          ) : (
            <div className="mb-6 mx-8">{renderTranscription()}</div>
          )}
        </main>
        <footer className="fixed bottom-0 left-0 w-full md:left-1/2 md:-translate-x-1/2 bg-white border-t md:border md:rounded-2xl border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center z-50 max-w-[730px] gap-2 justify-center md:mb-4">
          <TransformDropdown
            onTransform={handleTransform}
            isStreaming={isStreaming}
          />
          <div className="flex gap-2 w-full md:flex-row max-w-md md:max-w-auto justify-between items-center">
            {/* <button
            className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => {
              setShowContinueModal(true);
            }}
          >
            <img src="/microphoneFull.svg" className="size-5 min-w-5 min-h-5" />
            <span>Continue</span>
          </button> */}
            <button
              className="flex-1 py-2 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isStreaming || isCurrentGenerating}
              onClick={async () => {
                if (isStreaming || isCurrentGenerating) return;
                // just copy the transcript to clipboard
                await navigator.clipboard.writeText(
                  getSelectedTransformation()
                );
                toast.success("Copied to clipboard!", {
                  id: "copy-to-clipboard",
                });
              }}
            >
              <CopyIcon className="size-5 min-w-5 min-h-5" />
              <span>Copy</span>
            </button>
            <Link
              href={`/grades/${gradeId}/subjects/${subjectId}/notes/${noteId}`}
              className="flex-1 py-2 rounded-lg border  font-medium flex items-center justify-center gap-2"
            >
              <PlusIcon className="size-5 min-w-5 min-h-5" />
              <span>New</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TranscriptionPageClient;
