import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { eq, inArray, count } from "drizzle-orm";
import { grades, subjects, resources } from "@/lib/db/schema";

export async function GET() {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allGrades = await db
      .select()
      .from(grades)
      .where(eq(grades.userId, userSession.user.id));

    const allSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        description: subjects.description,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        gradeId: subjects.gradeId,
        resourceCount: count(resources.id),
      })
      .from(subjects)
      .leftJoin(resources, eq(subjects.id, resources.subjectId))
      .where(
        inArray(
          subjects.gradeId,
          allGrades.map((grade) => grade.id)
        )
      )
      .groupBy(
        subjects.id,
        subjects.name,
        subjects.description,
        subjects.createdAt,
        subjects.updatedAt,
        subjects.gradeId
      );

    return NextResponse.json(allSubjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
