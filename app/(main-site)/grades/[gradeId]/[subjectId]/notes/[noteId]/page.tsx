import { getNoteById } from "@/lib/db/queries";
import TranscriptionPageClient from "@/components/TranscriptionPageClient";
import React from "react";

const ParticularNotePage = async ({
  params,
}: {
  params: Promise<{ gradeId: string; subjectId: string; noteId: string }>;
}) => {
  const { gradeId, subjectId, noteId } = await params;

  const note = await getNoteById(noteId);

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="block-space-mini big-container">
      <div>
        <h2>Viewing Note</h2>
      </div>

      <TranscriptionPageClient
        noteId={noteId}
        gradeId={gradeId}
        subjectId={subjectId}
      />
    </div>
  );
};

export default ParticularNotePage;
