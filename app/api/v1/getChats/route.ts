import { NextRequest } from "next/server";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import { cookies } from "next/headers";
import jsonwebtoken from "jsonwebtoken";

export const runtime = "nodejs"; // ensure Node.js runtime

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const token = (await cookies()).get("whatsappfirebase")?.value;

  let decoded: { uid: string } = { uid: "" };

  if (token) {
    try {
      decoded = jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { uid: string };
    } catch (e) {
      console.error("JWT verification failed:", e);
    }
  }

  const finalUid = uid || decoded.uid;
  if (!finalUid) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ Create a streaming response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const dbref = ref(database, `/chats/${finalUid}`);

      const listener = onValue(
        dbref,
        (snapshot) => {
          const data = snapshot.exists() ? Object.values(snapshot.val()) : [];
          const payload = JSON.stringify({ chats: data });

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        },
        (error) => {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${error.message}\n\n`)
          );
        }
      );

      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 20000); // prevent timeout

      // Cleanup when connection closes
      const close = () => {
        clearInterval(interval);
        off(dbref, "value", listener);
        controller.close();
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // for dev
    },
  });
}
