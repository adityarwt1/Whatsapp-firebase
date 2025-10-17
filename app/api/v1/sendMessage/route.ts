import { database } from "@/lib/firebase";
import { get, push, ref, set, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, uid, image, imageText } = await req.json();

    //validating id
    if (!chatId || !message || !uid) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    //chat ref and save
    const chatRef = ref(database, `/messages/${chatId}`);

    const messageRef = push(chatRef);

    if (image) {
      await set(messageRef, {
        image,
        message: imageText,
        sendAt: new Date().getTime(),
        uid,
      });
      await update(ref(database, `/chats/${chatId}`), {
        lastMessage: `Image - ${imageText} `,
        lastInteraction: new Date().getTime(),
      });
      return NextResponse.json(
        {
          message: "Image sent successfully",
          sent: true,
        },
        { status: 200 }
      );
    }
    await set(messageRef, {
      message,
      sendAt: new Date().getTime(),
      uid,
    });
    await update(ref(database, `/chats/${chatId}`), {
      lastMessage: message,
      lastInteraction: new Date().getTime(),
    });
    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 200 }
    );
  }
}
