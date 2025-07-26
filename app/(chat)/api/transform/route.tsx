import { NextRequest } from "next/server";
import { streamText } from "ai";
import { auth } from "@/app/(auth)/auth";
import { notes, transformations } from "@/lib/db/schema";
import { db } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { RECORDING_TYPES } from "@/lib/utils";
import { googleAISDKProvider } from "@/lib/ai/providers";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const { noteId, typeName } = body;

  const [note] = await db.select().from(notes).where(eq(notes.id, noteId));

  if (!note) {
    return new Response(JSON.stringify({ error: "Note not found" }), {
      status: 404,
    });
  }

  // Create transformation in DB
  const [transformation] = await db
    .insert(transformations)
    .values({
      noteId,
      typeName,
      text: "",
      isGenerating: true,
    })
    .returning();

  // Prepare prompt
  const typeFullName =
    RECORDING_TYPES.find((t) => t.value === typeName)?.name || typeName;

  const prompt = `
  You are a helpful assistant. You will be given a transcription of an audio recording and you will generate a ${typeFullName} based on the transcription with markdown formatting. 
  Only output the generation itself, with no introductions, explanations, or extra commentary.
  
  The transcription is: ${note.content}

  ${(() => {
    switch (typeName) {
      case "summary":
        return "Return a summary of the transcription with a maximum of 100 words.";
      case "quick-note":
        return "Return a quick post it style note.";
      case "list":
        return "Return a list of bullet points of the transcription main  points.";
      case "blog":
        return "Return the Markdown of entire blog post with subheadings";
      case "email":
        return "If type is email also generate an email subject line and a short email body with introductory paragraph and a closing paragraph for thanking  the reader for reading.";
      default:
        return "";
    }
  })()}

  Remember to use output language like the input transcription language.

  Do not add phrases like "Based on the transcription" or "Let me know if you'd like me to help with anything else."
  `;

  // Start streaming
  const { textStream } = streamText({
    model: googleAISDKProvider("gemini-2.0-flash-001"),
    prompt,
  });

  // Create a ReadableStream to send id first, then stream text
  let fullText = "";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send the id as a JSON object first
      controller.enqueue(
        encoder.encode(JSON.stringify({ id: transformation.id }) + "\n")
      );
      // Stream the text
      for await (const chunk of textStream) {
        fullText += chunk;
        controller.enqueue(encoder.encode(chunk));
      }
      // Update DB at the end
      await db
        .update(transformations)
        .set({ text: fullText, isGenerating: false })
        .where(eq(transformations.id, transformation.id));
      controller.close();
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache",
    },
  });
}
