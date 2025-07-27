import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { notes } from "@/lib/db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getNotesFromSubjectId = tool({
  description:
    "Use this tool whenever we need to know the notes for a subject, it will return the notes for the subject. If the subject is not found, return null. This tool will be used whenever a user says the name of the subject and we want to return the id of the subject inside the database for further queries",
  inputSchema: z.object({
    subjectId: z
      .string()
      .describe("The id of the subject to get the notes for"),
  }),
  execute: async (input) => {
    const userSession = await auth();

    if (!userSession) {
      return { error: "Unauthorized" };
    }

    try {
      const foundNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.subjectId, input.subjectId));

      return foundNotes;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});
