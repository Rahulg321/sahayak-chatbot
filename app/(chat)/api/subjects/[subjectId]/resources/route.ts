import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { resources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;

  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allResources = await db
      .select({
        id: resources.id,
        name: resources.name,
      })
      .from(resources)
      .where(eq(resources.subjectId, subjectId));

    return NextResponse.json(allResources);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
