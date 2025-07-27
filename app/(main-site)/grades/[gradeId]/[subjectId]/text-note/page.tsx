import React from "react";
import TextEditor from "./note-editor";

const TextNotePage = async ({
  params,
}: {
  params: Promise<{ gradeId: string; subjectId: string }>;
}) => {
  const { gradeId, subjectId } = await params;
  return (
    <div className="block-space big-container">
      <h2>Add Text Note</h2>
      <div className="mt-4">
        <TextEditor gradeId={gradeId} subjectId={subjectId} />
      </div>
    </div>
  );
};

export default TextNotePage;
