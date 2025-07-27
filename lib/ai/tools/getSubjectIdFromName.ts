import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { subjects } from "@/lib/db/schema";
import { tool } from "ai";
import { eq, ilike } from "drizzle-orm";
import { z } from "zod";

export const getSubjectIdFromName = tool({
  description:
    "Use this tool whenever we need to know the id of a subject, it will return the id of the subject. If the subject is not found, return null. This tool will be used whenever a user says the name of the subject and we want to return the id of the subject inside the database for further queries",
  inputSchema: z.object({
    subjectName: z
      .string()
      .describe("The name of the subject to get the id for"),
  }),
  execute: async (input) => {
    const userSession = await auth();

    if (!userSession) {
      return { error: "Unauthorized" };
    }

    try {
      const subject = await db
        .select({
          id: subjects.id,
        })
        .from(subjects)
        .where(
          // Use a "contains" clause for case-insensitive partial match
          ilike(subjects.name, `%${input.subjectName}%`)
        );

      return subject;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});
