"use server";

import { embeddings, resources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/queries";
import { auth } from "@/app/(auth)/auth";
import { revalidatePath } from "next/cache";

export async function deleteResource(
  resourceId: string,
  gradeId: string,
  subjectId: string
) {
  const userSession = await auth();

  if (!userSession?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!resourceId) {
    return {
      success: false,
      message: "Resource id is required",
    };
  }

  if (!gradeId) {
    return {
      success: false,
      message: "Grade id is required",
    };
  }

  if (!subjectId) {
    return {
      success: false,
      message: "Subject ID is required",
    };
  }

  try {
    await db.delete(embeddings).where(eq(embeddings.resourceId, resourceId));
    await db.delete(resources).where(eq(resources.id, resourceId));

    revalidatePath(`/grades/${gradeId}/${subjectId}`);

    return {
      success: true,
      message: "Resource deleted successfully",
    };
  } catch (error) {
    console.log("an error while deleting resource");

    console.error(error);
    return {
      success: false,
      message: "Failed to delete resource",
    };
  }
}
