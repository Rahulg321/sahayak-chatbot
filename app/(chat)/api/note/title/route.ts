import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title } = await req.json();

  try {
    const note = await db.update(notes).set({ title }).where(eq(notes.id, id));

    return NextResponse.json(note);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
