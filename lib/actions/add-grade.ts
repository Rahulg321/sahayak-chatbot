"use server";

import { auth } from "@/app/(auth)/auth";
import { addGradeSchema, addGradeSchemaType } from "../schemas/grade-schema";
import { db } from "../db/queries";
import { grades } from "../db/schema";
import { revalidatePath } from "next/cache";

export async function addGrade(values: addGradeSchemaType) {
  const userSession = await auth();

  if (!userSession) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const validatedFields = addGradeSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Incorrect fields were entered",
    };
  }

  try {
    await db.insert(grades).values({
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      userId: userSession.user.id,
    });

    revalidatePath("/home");
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
