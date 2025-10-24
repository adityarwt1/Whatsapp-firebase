import { database } from "@/lib/firebase";
import {
  equalTo,
  get,
  orderByValue,
  query,
  ref,
  update,
} from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { chatId, uid } = await req.json();

    if (!chatId || !uid) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const chatRef = ref(database, `/chats/${chatId}`);

    const snapshot = await get(chatRef);

    const data = snapshot.val();

    if (data.uid1 == uid) {
      await update(chatRef, {
        unread1: 0,
      });
      return NextResponse.json({ message: "Unread cleared" }, { status: 200 });
    }
    await update(chatRef, {
      unread2: 0,
    });
    return NextResponse.json({ message: "Unread cleared" }, { status: 200 });
  } catch (error) {
    console.log(error as Error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
