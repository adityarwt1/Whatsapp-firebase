import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

function getLastSeenStatus(timeStamp: string | number): string {
  if (timeStamp === "online") return "online"; // or some online check

  const lastSeenDate = new Date(timeStamp);
  const now = new Date();

  const isToday =
    lastSeenDate.getDate() === now.getDate() &&
    lastSeenDate.getMonth() === now.getMonth() &&
    lastSeenDate.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    lastSeenDate.getDate() === yesterday.getDate() &&
    lastSeenDate.getMonth() === yesterday.getMonth() &&
    lastSeenDate.getFullYear() === yesterday.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  if (isToday) {
    return `last seen today at ${lastSeenDate.toLocaleTimeString(
      [],
      timeOptions
    )}`;
  } else if (isYesterday) {
    return `last seen yesterday at ${lastSeenDate.toLocaleTimeString(
      [],
      timeOptions
    )}`;
  } else {
    return `last seen on ${lastSeenDate.toLocaleDateString()} at ${lastSeenDate.toLocaleTimeString(
      [],
      timeOptions
    )}`;
  }
}

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
      lastOnline: await getLastSeenStatus(timeStam),
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
