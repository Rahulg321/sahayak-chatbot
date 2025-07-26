"use server";

import { auth } from "@/app/(auth)/auth";
import { addGradeSchema, addGradeSchemaType } from "../schemas/grade-schema";
import { db } from "../db/queries";
import { grades, subjects } from "../db/schema";
import { revalidatePath } from "next/cache";
import {
  addSubjectSchema,
  addSubjectSchemaType,
} from "../schemas/subject-schema";

export async function addSubject(
  values: addSubjectSchemaType,
  gradeId: string
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

  const validatedFields = addSubjectSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Incorrect fields were entered",
    };
  }

  try {
    await db.insert(subjects).values({
      name: validatedFields.data.name,
      description: validatedFields.data.description,
      gradeId,
    });

    revalidatePath("/home");
    revalidatePath(`/grades/${gradeId}`);
    revalidatePath("/grades");

    return {
      success: true,
      message: "Grade was added successfully",
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Incorrect fields were entered",
    };
  }
}
