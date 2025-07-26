import RecordingModal from "@/components/dialogs/RecordingModal";
import React from "react";

const AddVoiceNotePage = async ({
  params,
}: {
  params: Promise<{ gradeId: string; subjectId: string }>;
}) => {
  const { gradeId, subjectId } = await params;

  return (
    <div className="block-space big-container">
      <div>
        <h1>Add Voice Note</h1>
      </div>

      <RecordingModal gradeId={gradeId} subjectId={subjectId} />
    </div>
  );
};

export default AddVoiceNotePage;
