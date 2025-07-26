import { auth } from "@/app/(auth)/auth";
import { googleAISDKProvider, googleGenAIProvider } from "@/lib/ai/providers";
import { NextRequest, NextResponse } from "next/server";
import { createUserContent, createPartFromUri } from "@google/genai";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import { db } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { audioTracks, notes } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const language = formData.get("language") as string;
  const durationSeconds = formData.get("durationSeconds") as string;
  const subjectId = formData.get("subjectId") as string;
  const gradeId = formData.get("gradeId") as string;

  if (!file) {
    return new Response("File is required", { status: 400 });
  }

  if (!language) {
    return new Response("Language is required", { status: 400 });
  }

  if (!durationSeconds) {
    return new Response("Duration is required", { status: 400 });
  }

  let transcription = "";

  let fileUploadedUrl;

  try {
    const data = await put(`${file.name}`, file, {
      access: "public",
    });

    fileUploadedUrl = data.url;
  } catch (error) {
    console.log("Error: ", error);
    return new Response("Failed to upload file", { status: 500 });
  }

  try {
    const myfile = await googleGenAIProvider.files.upload({
      file: file,
      config: { mimeType: "audio/mp3" },
    });

    const response = await googleGenAIProvider.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri!, myfile.mimeType!),
        "Generate a transcription of the audio clip",
      ]),
    });
    console.log("Transcription response: ", response.text);
    transcription = response.text!;
  } catch (error) {
    console.log("Error: ", error);
  }

  const { text } = await generateText({
    model: googleAISDKProvider("gemini-2.5-flash"),
    prompt: `Generate a title for the following transcription with max of 10 words/80 characters: 
        ${transcription}
        
        Only return the title, nothing else, no explanation and no quotes or followup.
        `,
  });

  console.log("title of the note geenrated", text);

  const noteId = formData.get("noteId") as string;

  if (noteId) {
    const [note] = await db.select().from(notes).where(eq(notes.id, noteId));

    if (!note) {
      console.log("note does not exist, but note id is present");
      return NextResponse.json({
        success: false,
        message: "Note not found",
      });
    }

    console.log("inserting an audio track");

    await db.insert(audioTracks).values({
      fileUrl: fileUploadedUrl,
      transcription: transcription,
      noteId: noteId,
    });

    console.log("audio track inserted");

    console.log("Note: ", note);

    await db
      .update(notes)
      .set({
        content: note.content + "\n" + transcription,
      })
      .where(eq(notes.id, noteId));

    revalidatePath(`/grades/${gradeId}/${subjectId}`);

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      noteId: noteId,
    });
  } else {
    const [newNote] = await db
      .insert(notes)
      .values({
        title: text,
        content: transcription,
        type: "voice",
        subjectId: subjectId,
        userId: userSession.user.id,
      })
      .returning();

    await db.insert(audioTracks).values({
      fileUrl: fileUploadedUrl,
      transcription: transcription,
      noteId: newNote.id!,
    });

    revalidatePath(`/grades/${gradeId}/${subjectId}`);

    return NextResponse.json({
      success: true,
      message: "Note created successfully",
      noteId: newNote.id!,
    });
  }
}
