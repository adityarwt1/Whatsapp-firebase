import { database } from "@/lib/firebase";
import { get, push, ref, set, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, uid, image, imageText } = await req.json();

    if (!chatId || !uid) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Get chat details
    const chatRef = ref(database, `/chats/${chatId}`);
    const chatSnap = await get(chatRef);
    const chatData = chatSnap.val();

    if (!chatData) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isUser1 = chatData.uid1 === uid;
    const messageRef = push(ref(database, `/messages/${chatId}`));

    // unread logic
    const unread1 = isUser1 ? 0 : (chatData.unread1 || 0) + 1;
    const unread2 = isUser1 ? (chatData.unread2 || 0) + 1 : 0;

    // For image message
    if (image) {
      await set(messageRef, {
        image,
        message: imageText,
        sendAt: Date.now(),
        uid,
      });

      await update(chatRef, {
        unread1,
        unread2,
        lastMessage: `Image - ${imageText}`,
        lastInteraction: Date.now(),
      });

      return NextResponse.json({
        message: "Image sent successfully",
        sent: true,
      });
    }

    // For text message
    await set(messageRef, {
      message,
      sendAt: Date.now(),
      uid,
    });

    await update(chatRef, {
      unread1,
      unread2,
      lastMessage: message,
      lastInteraction: Date.now(),
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
