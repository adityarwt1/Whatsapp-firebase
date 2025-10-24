import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { timeStam, uid } = await req.json();

    if (!timeStam || !uid) {
      return NextResponse.json(
        { error: "time stams required" },
        { status: 400 }
      );
    }

    const userRef = ref(database, `/users/${uid}`);

    await update(userRef, {
      lastOnline: timeStam,
    });

    return NextResponse.json(
      { message: "Last Online updated" },
      { status: 200 }
    );
  } catch (error) {
    console.log((error as Error).message);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
