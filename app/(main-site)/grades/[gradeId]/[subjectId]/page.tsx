import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  ChevronRight,
  FileText,
  BookOpen,
  Users,
  FolderOpen,
  ClipboardList,
  PlusCircle,
  Mic,
} from "lucide-react";

import AddSubjectDialog from "@/components/dialogs/AddSubjectDialog";
import React, { Suspense } from "react";
import {
  getAllSubjectResources,
  getGradeById,
  getSubjectById,
} from "@/lib/db/queries";
import AddAudioDialog from "@/components/dialogs/add-audio-dialog";
import AddDocumentDialog from "@/components/dialogs/add-document-dialog";
import { auth } from "@/app/(auth)/auth";
import ResourceCard from "@/components/resource-card";

const page = async ({
  params,
}: {
  params: Promise<{ gradeId: string; subjectId: string }>;
}) => {
  const userSession = await auth();

  if (!userSession) redirect("/login");

  console.log("user Session", userSession);

  const gradeId = (await params).gradeId;
  const subjectId = (await params).subjectId;

  const currentGrade = await getGradeById(gradeId);
  const currentSubject = await getSubjectById(subjectId);

  if (!currentGrade || !currentSubject) {
    return notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "Not Started":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="narrow-container block-space">
      <nav className="mb-4 flex items-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="mx-2 size-4" />
        <Link
          href={`/grades/${currentGrade.id}`}
          className="hover:text-primary"
        >
          {currentGrade.title}
        </Link>
        <ChevronRight className="mx-2 size-4" />
        <span>{currentSubject.name}</span>
      </nav>{" "}
      <div></div>
      <div>
        <Tabs defaultValue="worksheets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="worksheets">
              <FileText className="mr-2 size-4" />
              Worksheets
            </TabsTrigger>
            <TabsTrigger value="curriculum">
              <BookOpen className="mr-2 size-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="mr-2 size-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FolderOpen className="mr-2 size-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="notes">
              <ClipboardList className="mr-2 size-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="worksheets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Worksheets</CardTitle>
                <CardDescription>
                  Track progress on assigned worksheets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody></TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Curriculum</CardTitle>
                <CardDescription>
                  View and manage the curriculum for this subject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4"></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  List of students currently in this subject.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Repository for class resources.
                  </CardDescription>
                </div>
                <div>
                  <AddAudioDialog subjectId={subjectId} gradeId={gradeId} />
                  <AddDocumentDialog
                    userSession={userSession}
                    subjectId={subjectId}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading......</div>}>
                  <FetchingSubjectResources
                    subjectId={subjectId}
                    gradeId={gradeId}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subject Notes</CardTitle>
                  <CardDescription>
                    Private notes and reminders for this subject.
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 size-4" />
                      Add Note
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileText className="mr-2 size-4" />
                      <span>Add Text Note</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mic className="mr-2 size-4" />
                      <span>Add Voice Note</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Suspense>
                  <FetchingSubjectNotes />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default page;

const FetchingSubjectResources = async ({
  subjectId,
  gradeId,
}: {
  subjectId: string;
  gradeId: string;
}) => {
  const userSubjectResources = await getAllSubjectResources(subjectId);

  if (!userSubjectResources) {
    return (
      <div>
        <h3>No Resources Found</h3>
      </div>
    );
  }

  return (
    <div>
      <div>
        {userSubjectResources.map((e) => {
          return (
            <ResourceCard
              key={e.id}
              resourceId={e.id}
              resourceName={e.name}
              resourceKind={e.kind as string}
              resourceDescription={e.description}
              gradeId={gradeId}
              subjectId={subjectId}
            />
          );
        })}
      </div>
    </div>
  );
};

const FetchingSubjectNotes = () => {
  return <div>FetchingSubjectNotes</div>;
};
