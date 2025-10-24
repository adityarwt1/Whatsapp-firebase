import { database } from "@/lib/firebase";
import {
  get,
  orderByChild,
  orderByValue,
  push,
  query,
  ref,
  set,
} from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, fullName, photoURL, currentUid } = await req.json();
    console.log(photoURL);
    //validating request
    if (!uid || !email || !fullName || !photoURL || !currentUid) {
      return NextResponse.json({ error: "Badrequest" }, { status: 400 });
    }
    //finding current user information
    const currentUserf = ref(database, `/users/${currentUid}`);
    const snapshot = await get(currentUserf);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = snapshot.val();
    const chatRef = ref(database, `/chats`);
    const newRef = push(chatRef);
    await set(newRef, {
      uid1: uid,
      uid2: user.uid,
      email1: email,
      email2: user.email,
      fullName1: fullName,
      fullname2: user.fullName,
      photoURL1: photoURL,
      photoURL2: user.photoURL,
      lastMessage: "Strat new Chat!",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
