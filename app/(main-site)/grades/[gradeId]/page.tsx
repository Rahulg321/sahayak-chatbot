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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{grade.title}</h1>
          <p className="text-muted-foreground mt-2">
            Select a subject to view available resources
          </p>
        </div>
        <AddSubjectDialog gradeId={gradeId} />
      </div>

      {grade.subjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first subject to this grade.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {grade.subjects.map((subject) => (
            <Link
              href={`/grades/${grade.id}/${subject?.id}`}
              key={subject?.id}
              className="group"
            >
              <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {subject?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {subject?.name}
                      </CardTitle>
                      {subject?.description && (
                        <CardDescription className="text-sm mt-1 line-clamp-2">
                          {subject?.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Click to view resources</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
