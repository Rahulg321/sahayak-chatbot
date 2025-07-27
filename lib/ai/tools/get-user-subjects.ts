import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { grades, subjects } from "@/lib/db/schema";
import { tool } from "ai";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const getUserSubjects = tool({
  description:
    "Use this tool whenever we need to know what subjects the user teaches, it will return an array of all subjects the user teaches and in all of the grades",
  inputSchema: z.object({}),
  execute: async () => {
    const userSession = await auth();

    if (!userSession) {
      return { error: "Unauthorized" };
    }

    try {
      const userGrades = await db
        .select({
          id: grades.id,
        })
        .from(grades)
        .where(eq(grades.userId, userSession.user.id))
        .orderBy(asc(grades.id));

      const userGradesIds = userGrades.map((grade) => grade.id);

      const userSubjects = await db
        .select({
          id: subjects.id,
          name: subjects.name,
          description: subjects.description,
        })
        .from(subjects)
        .where(inArray(subjects.gradeId, userGradesIds))
        .orderBy(asc(subjects.id));

      return userSubjects;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});
