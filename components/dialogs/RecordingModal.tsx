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
import { MicrochipIcon } from "lucide-react";
import { StopIcon } from "../icons";

const RecordingModal = () => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#101828]">Start Recording</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <Button
          className={cn(
            recording ? "bg-[#6D1414]" : "bg-[#101828]",
            "w-[352px] h-[86px] rounded-xl flex flex-row gap-3 items-center justify-center my-5"
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
              <StopIcon />
              <p className="text-white">Stop Recording</p>
            </>
          ) : (
            <MicrochipIcon className="size-10 text-white" />
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;
