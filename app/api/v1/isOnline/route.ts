import { database } from "@/lib/firebase";
import { onValue, ref, off } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Uid is required" }, { status: 400 });
    }

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Reference to Firebase user
        const userRef = ref(database, `/users/${uid}`);

        // Listen for changes
        const unsubscribe = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ user: data })}\n\n`)
          );
        });

        // Close the stream if the client disconnects
        // This is important in SSE
        controller.close = () => {
          off(userRef, "value", unsubscribe);
          controller.close();
        };
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const data = { error: (error as Error).message };
    return new Response(JSON.stringify(data), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
