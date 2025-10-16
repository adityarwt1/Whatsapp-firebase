import { database } from "@/lib/firebase";
import { get, push, ref, set, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, uid } = await req.json();

    //validating id
    if (!chatId || !message || !uid) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    //chat ref and save
    const chatRef = ref(database, `/messages/${chatId}`);

    const messageRef = push(chatRef);

    await set(messageRef, {
      message,
      sendAt: new Date().getTime(),
      uid,
    });
    await update(ref(database, `/chats/${chatId}`), { lastMessage: message });
    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 200 }
    );
  }
}
