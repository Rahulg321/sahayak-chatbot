import { db } from "@/lib/db/queries";
import { notes, transformations, audioTracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    console.log("inside notes with tracks");
    console.log(noteId);

    // Fetch the note
    const noteWithAudioTracks = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId));

    if (!noteWithAudioTracks || noteWithAudioTracks.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Fetch audio tracks for this note
    const fetchedAudioTracks = await db
      .select()
      .from(audioTracks)
      .where(eq(audioTracks.noteId, noteId));

    // Fetch transformations for this note
    const fetchedTransformations = await db
      .select()
      .from(transformations)
      .where(eq(transformations.noteId, noteId));

    return NextResponse.json({
      note: {
        ...noteWithAudioTracks[0],
        audioTracks: fetchedAudioTracks,
        transformations: fetchedTransformations,
      },
    });
  } catch (error) {
    console.error("Error fetching note with tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Keep GET handler for backward compatibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    console.log("inside notes with tracks (GET)");
    console.log(noteId);

    // Fetch the note
    const noteWithAudioTracks = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId));

    if (!noteWithAudioTracks || noteWithAudioTracks.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Fetch audio tracks for this note
    const fetchedAudioTracks = await db
      .select()
      .from(audioTracks)
      .where(eq(audioTracks.noteId, noteId));

    // Fetch transformations for this note
    const fetchedTransformations = await db
      .select()
      .from(transformations)
      .where(eq(transformations.noteId, noteId));

    return NextResponse.json({
      note: {
        ...noteWithAudioTracks[0],
        audioTracks: fetchedAudioTracks,
        transformations: fetchedTransformations,
      },
    });
  } catch (error) {
    console.error("Error fetching note with tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
