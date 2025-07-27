"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { SetStateAction, Dispatch, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Checkbox } from "../ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "../ui/scroll-area";

export default function ResourceSelectDialog({
  selectedResources,
  setSelectedResources,
}: {
  selectedResources: { id: string; name: string }[];
  setSelectedResources: Dispatch<
    SetStateAction<{ id: string; name: string }[]>
  >;
}) {
  const {
    data: fetchedSubjects,
    error: subjectsError,
    isLoading: subjectsIsLoading,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => fetch("/api/subjects").then((res) => res.json()),
  });

  console.log("fetchedSubjects", fetchedSubjects);

  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const {
    data: fetchedResources,
    error: resourcesError,
    isLoading: resourcesIsLoading,
  } = useQuery({
    queryKey: ["resources", selectedSubject],
    queryFn: () =>
      fetch(`/api/subjects/${selectedSubject}/resources`).then((res) =>
        res.json()
      ),
    enabled: !!selectedSubject,
  });

  console.log("fetchedResources:", fetchedResources);
  console.log("resourcesError:", resourcesError);

  useEffect(() => {
    if (!open) {
      setSelectedSubject(null);
    }
  }, [open]);

  const handleResourceSelect = (resource: { id: string; name: string }) => {
    console.log("Resource selected:", resource);
    setSelectedResources((prev) => {
      const isAlreadySelected = prev.find((r) => r.id === resource.id);
      const newSelection = isAlreadySelected
        ? prev.filter((r) => r.id !== resource.id)
        : [...prev, { ...resource }];
      console.log("New selection:", newSelection);
      return newSelection;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size={"sm"}
          className="rounded-full"
          aria-label="Select Resource"
        >
          Select Resources
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {selectedSubject ? "Select a Resource" : "Select a Subject"}
          </DialogTitle>
          <DialogDescription>
            {selectedSubject
              ? "Select a document from the selected subject."
              : "Select a subject first then see its available documents."}
          </DialogDescription>
        </DialogHeader>

        {selectedSubject ? (
          <DisplayResourcesScreen
            resources={fetchedResources}
            isLoading={resourcesIsLoading}
            error={resourcesError}
            onBack={() => setSelectedSubject(null)}
            selectedResources={selectedResources}
            onResourceSelect={handleResourceSelect}
          />
        ) : (
          <DisplaySubjectsScreen
            subjects={fetchedSubjects}
            isLoading={subjectsIsLoading}
            error={subjectsError}
            onSelectSubject={setSelectedSubject}
          />
        )}
        <DialogFooter>
          {selectedSubject && (
            <Button
              onClick={() => {
                // Here you can do something with the selected resources
                // For now, we'll just log them and close the dialog
                console.log("Selected resources:", selectedResources);
                setOpen(false);
              }}
              disabled={selectedResources.length === 0}
            >
              Select ({selectedResources.length})
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DisplaySubjectsScreen({
  subjects,
  isLoading,
  error,
  onSelectSubject,
}: {
  subjects: { id: string; name: string; resourceCount: number }[];
  isLoading: boolean;
  error: any;
  onSelectSubject: (subjectId: string) => void;
}) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (subjects && subjects.length === 0) {
    return <div>No subjects found. Please contact support.</div>;
  }

  return (
    <div className="space-y-2">
      {subjects &&
        subjects.length > 0 &&
        subjects.map((subject) => (
          <div
            key={subject.id}
            className="flex items-center justify-between gap-2 cursor-pointer p-2 hover:bg-accent rounded-md"
            onClick={() => onSelectSubject(subject.id)}
          >
            <p className="text-sm font-medium">{subject.name}</p>
            <p className="text-sm text-muted-foreground">
              {subject.resourceCount} resources
            </p>
          </div>
        ))}
    </div>
  );
}

function DisplayResourcesScreen({
  resources,
  isLoading,
  error,
  onBack,
  selectedResources,
  onResourceSelect,
}: {
  resources: { id: string; name: string }[];
  isLoading: boolean;
  error: any;
  onBack: () => void;
  selectedResources: { id: string; name: string }[];
  onResourceSelect: (resource: { id: string; name: string }) => void;
}) {
  return (
    <div>
      <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
        Back to Subjects
      </Button>
      {isLoading ? (
        <ResourceCardSkeleton />
      ) : error ? (
        <div>Error fetching resources.</div>
      ) : (
        <div className="space-y-2">
          <ScrollArea className="h-[300px]">
            {resources && resources.length > 0 ? (
              resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isSelected={
                    selectedResources.find((r) => r.id === resource.id)
                      ? true
                      : false
                  }
                  onSelect={onResourceSelect}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  No resources found.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="space-y-2 p-2 w-full">
      {[...Array(3)].map((_, i) => (
        <div
          className="flex items-center gap-4 p-2 hover:bg-accent rounded-md"
          key={i}
        >
          <Skeleton className="size-5 rounded" />
          <div className="grid gap-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourceCard({
  resource,
  isSelected,
  onSelect,
}: {
  resource: { id: string; name: string };
  isSelected: boolean;
  onSelect: (resource: { id: string; name: string }) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ResourceCard clicked:", resource.id);
    onSelect(resource);
  };

  return (
    <div
      className="flex items-center gap-4 p-2 hover:bg-accent rounded-md cursor-pointer"
      onClick={handleClick}
    >
      <Checkbox
        checked={isSelected}
        id={resource.id}
        className="size-5"
        onCheckedChange={(checked) => {
          console.log("Checkbox changed:", checked, resource.id);
          if (checked !== "indeterminate") {
            onSelect(resource);
          }
        }}
      />
      <div className="grid gap-1.5">
        <p className="text-sm font-medium leading-none">{resource.name}</p>
      </div>
    </div>
  );
}
