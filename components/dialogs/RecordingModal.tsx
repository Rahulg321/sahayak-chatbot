"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  MicrochipIcon,
  MicIcon,
  PauseIcon,
  PauseCircleIcon,
  SpeakerIcon,
  XIcon,
} from "lucide-react";
import { StopIcon } from "../icons";
import { FaMicrophone } from "react-icons/fa6";
import { toast } from "sonner";
import { AudioWaveform } from "../AudioWaveForm";
import Image from "next/image";

const RecordingModal = ({
  noteId,
  gradeId,
  subjectId,
}: {
  noteId?: string;
  gradeId: string;
  subjectId: string;
}) => {
  const [language, setLanguage] = useLocalStorage("language", "en");

  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState<
    "idle" | "uploading" | "transcribing"
  >("idle");

  const [pendingSave, setPendingSave] = useState(false);

  const {
    recording,
    paused,
    audioBlob,
    analyserNode,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecording();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((result) => {
          // setMicPermission(result.state as "granted" | "denied" | "prompt");
          result.onchange = () => {};
        });
    }
  }, []);

  const handleSaveRecording = async () => {
    if (!audioBlob) {
      toast.error("No audio to save. Please record something first.");
      return;
    }
    setIsProcessing("uploading");
    try {
      // Upload to S3
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      formData.append("durationSeconds", duration.toString());
      formData.append("gradeId", gradeId);
      formData.append("subjectId", subjectId);

      if (noteId) {
        formData.append("noteId", noteId);
      }

      const response = await fetch("/api/voice-note-transcription", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      console.log(
        "blob was created successfully now saving it to the database"
      );

      router.push(`/grades/${gradeId}/${subjectId}/notes/${data.noteId}`);
    } catch (err) {
      toast.error("Failed to transcribe audio. Please try again.");
      setIsProcessing("idle");
    }
  };

  useEffect(() => {
    if (pendingSave && audioBlob) {
      setPendingSave(false);
      handleSaveRecording();
    }
  }, [pendingSave, audioBlob]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="">Start Recording</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create A Voice Note</DialogTitle>
          <DialogDescription>
            Start Speaking and create a voice note
          </DialogDescription>
        </DialogHeader>

        {isProcessing !== "idle" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <Image
              src="/loading.svg"
              alt="Loading"
              className="size-8 animate-spin"
              width={32}
              height={32}
            />
            <p className="text-gray-500">
              {isProcessing === "uploading"
                ? "Uploading audio recording"
                : "Transcribing audio..."}
              <span className="animate-pulse">...</span>
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center w-full bg-white">
              {!recording ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                  <p className="text-gray-500">Start Recording</p>
                </div>
              ) : (
                <div className="flex flex-row gap-8 mt-8">
                  {/* X Button: Reset recording */}
                  <button
                    className="size-10 bg-[#FFEEEE] p-2.5 rounded-xl cursor-pointer"
                    onClick={resetRecording}
                    type="button"
                    aria-label="Reset recording"
                  >
                    <XIcon className="size-5 min-w-5" />
                  </button>

                  <div className="flex flex-col gap-1">
                    <p className="text-base text-center text-[#364153]">
                      {formatTime(duration)}
                    </p>
                    <AudioWaveform
                      analyserNode={analyserNode}
                      isPaused={paused}
                    />
                  </div>

                  {/* Pause/Resume Button */}
                  {paused ? (
                    <button
                      className="size-10 bg-[#1E2939] p-2.5 rounded-xl cursor-pointer"
                      onClick={resumeRecording}
                      type="button"
                      aria-label="Resume recording"
                    >
                      <MicIcon className="size-5 min-w-5 text-white" />
                    </button>
                  ) : (
                    <button
                      className="size-10 p-2.5 rounded-xl cursor-pointer"
                      onClick={pauseRecording}
                      type="button"
                      aria-label="Pause recording"
                    >
                      <PauseIcon className="size-5 min-w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <Button
              className={cn(
                recording ? "bg-destructive" : "bg-muted hover:bg-muted/80",
                "rounded-xl flex flex-row gap-3 items-center justify-center my-5"
              )}
              onClick={async () => {
                if (recording) {
                  stopRecording();
                  setPendingSave(true);
                } else {
                  startRecording();
                }
              }}
              disabled={isProcessing !== "idle"}
            >
              {recording ? (
                <>
                  <PauseCircleIcon className="size-6" />
                  <p className="text-white">Stop Recording</p>
                </>
              ) : (
                <FaMicrophone className="size-6 text-white" />
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;
