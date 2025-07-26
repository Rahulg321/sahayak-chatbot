import AddSubjectDialog from "@/components/dialogs/AddSubjectDialog";
import { getGradeByGradeId } from "@/lib/db/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const page = async ({ params }: { params: Promise<{ gradeId: string }> }) => {
  const { gradeId } = await params;

  const grade = await getGradeByGradeId(gradeId);

  if (!grade) {
    notFound();
  }

  return (
    <div className="block-space big-container">
      <div className="flex">
        <h3>View Subjects for {grade.title}</h3>
        <AddSubjectDialog gradeId={gradeId} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {grade.subjects.map((subject) => (
          <Link
            href={`/grades/${grade.id}/${subject?.id}`}
            key={subject?.id}
            className="group"
          >
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <CardTitle className="text-xl font-bold">
                  {subject?.name}
                </CardTitle>
                <CardDescription>{subject?.description}</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default page;
