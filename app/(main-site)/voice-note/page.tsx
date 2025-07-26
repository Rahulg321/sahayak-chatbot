import RecordingModal from "@/components/dialogs/RecordingModal";
import React from "react";

const VoiceNotePage = () => {
  return (
    <div className="block-space big-container">
      <h2>Create a Voice Note</h2>
      <div>
        <RecordingModal />
      </div>
    </div>
  );
};

export default VoiceNotePage;
