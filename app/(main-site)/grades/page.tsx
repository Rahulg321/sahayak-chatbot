import { auth } from "@/app/(auth)/auth";
import AddGradeDialog from "@/components/dialogs/AddGradeDialog";
import { getAllGradesByUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowBigRight, ArrowRight } from "lucide-react";

const page = async () => {
  const userSession = await auth();

  if (!userSession) {
    redirect("/login");
  }

  const allGrades = await getAllGradesByUser(userSession.user.id);

  return (
    <div className="block-space big-container">
      <div>
        <AddGradeDialog />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Educator&apos;s Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Select a grade to manage subjects and students.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allGrades?.map((grade) => (
            <Link href={`/grades/${grade.id}`} key={grade.id} className="group">
              <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {grade.title}
                  </CardTitle>
                  <CardDescription>{grade.description}</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default page;
