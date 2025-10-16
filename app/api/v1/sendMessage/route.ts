import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, parentPath, childPath, currentUid } = await req.json();

    if (!message || !parentPath || !childPath) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const dbref = ref(
      database,
      // `/chats/$${parentPath}/${childPath}/${currentUid}`
      `/chats/${parentPath}/${childPath}/${currentUid}`
    );

    const curretnTimeSpan = new Date().getTime();
    await update(dbref, {
      [curretnTimeSpan]: message,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error as Error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
