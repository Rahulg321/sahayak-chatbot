import { Notes } from "@/lib/db/schema";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon, MessageIcon } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NoteCardProps {
  note: Notes;
  onClick?: () => void;
  className?: string;
  gradeId: string;
  subjectId: string;
}

const NoteCard = ({
  note,
  onClick,
  className,
  gradeId,
  subjectId,
}: NoteCardProps) => {
  const isVoiceNote = note.type === "voice";

  return (
    <Link href={`/grades/${gradeId}/${subjectId}/notes/${note.id}`}>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${className || ""}`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {isVoiceNote ? <MessageIcon size={16} /> : <FileIcon size={16} />}
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {note.title}
              </CardTitle>
            </div>
            <Badge variant={isVoiceNote ? "default" : "secondary"}>
              {isVoiceNote ? "Voice" : "Text"}
            </Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Created{" "}
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>

        {note.content && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {note.content}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default NoteCard;
