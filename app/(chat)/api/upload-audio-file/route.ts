import { auth } from "@/app/(auth)/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userSession = await auth();

  if (!userSession?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const data = await put(`${file.name}`, fileBuffer, {
      access: "public",
    });

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
