import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { notes, resources } from "@/lib/db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getAllSubjectResources = tool({
  description:
    "Use this tool whenever we need to know all the resources for a subject, it will return an array of resources. Resources for a subject could include notes like voice notes or text notes, or documents like pdfs or images",
  inputSchema: z.object({
    subjectId: z
      .string()
      .describe("The id of the subject to get resources for"),
  }),
  execute: async (input) => {
    const userSession = await auth();

    if (!userSession) {
      return { error: "Unauthorized" };
    }

    try {
      const subjectResources = await db
        .select({
          id: resources.id,
          name: resources.name,
          kind: resources.kind,
          url: resources.fileUrl,
          createdAt: resources.createdAt,
        })
        .from(resources)
        .where(eq(resources.subjectId, input.subjectId));

      const subjectNotes = await db
        .select({
          id: notes.id,
          title: notes.title,
          type: notes.type,
          createdAt: notes.createdAt,
        })
        .from(notes)
        .where(eq(notes.subjectId, input.subjectId));

      return [...subjectResources, ...subjectNotes];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});
