"use server";

import { auth } from "@/app/(auth)/auth";
import { addGradeSchema, addGradeSchemaType } from "../schemas/grade-schema";
import { db } from "../db/queries";
import { grades, notes, subjects } from "../db/schema";
import { revalidatePath } from "next/cache";
import {
  addSubjectSchema,
  addSubjectSchemaType,
} from "../schemas/subject-schema";

export async function addTextNote(
  content: string,
  title: string,
  gradeId: string,
  subjectId: string
) {
  const userSession = await auth();

  if (!userSession) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!gradeId) {
    return {
      success: false,
      message: "Grade Id is not present",
    };
  }

  try {
    await db.insert(notes).values({
      content,
      type: "text",
      title: title || "Untitled",
      subjectId,
      userId: userSession.user.id,
    });

    revalidatePath("/home");
    revalidatePath(`/grades/${gradeId}/${subjectId}`);
    revalidatePath("/grades");

    return {
      success: true,
      message: "Note was added successfully",
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Incorrect fields were entered",
    };
  }
}
