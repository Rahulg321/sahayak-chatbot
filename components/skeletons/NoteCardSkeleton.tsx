import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NoteCardSkeleton() {
  return (
    <Card className="w-full max-w-2xl bg-muted border-muted-foreground">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-6 rounded-full bg-muted-foreground" />
          <Skeleton className="h-6 w-48 bg-muted-foreground" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md bg-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-40 bg-muted-foreground" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-muted-foreground" />
          <Skeleton className="h-4 w-full bg-muted-foreground" />
          <Skeleton className="h-4 w-3/4 bg-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
