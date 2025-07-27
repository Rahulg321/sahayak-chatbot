import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { grades } from "@/lib/db/schema";
import { tool } from "ai";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

export const getUserGrades = tool({
  description:
    "Get the user's grades, use this tool whenever we need to know the user's grades, it will return an array of grades",
  inputSchema: z.object({}),
  execute: async () => {
    const userSession = await auth();

    if (!userSession) {
      return { error: "Unauthorized" };
    }

    try {
      const userGrades = await db
        .select()
        .from(grades)
        .where(eq(grades.userId, userSession.user.id))
        .orderBy(asc(grades.id));

      return userGrades;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});
