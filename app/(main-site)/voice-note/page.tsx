import React from "react";
import RecordingModal from "@/components/dialogs/RecordingModal";

const VoiceNotePage = async ({
  params,
}: {
  params: Promise<{ gradeId: string; subjectId: string }>;
}) => {
  const { gradeId, subjectId } = await params;
  return (
    <div className="block-space big-container">
      <h2>Create a Voice Note</h2>
      <div>
        <RecordingModal gradeId={gradeId} subjectId={subjectId} />
      </div>
    </div>
  );
};

export default VoiceNotePage;
