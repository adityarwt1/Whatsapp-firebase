import { NextRequest } from "next/server";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
} from "firebase/database";
import { database } from "@/lib/firebase";
import { cookies } from "next/headers";
import jsonwebtoken from "jsonwebtoken";
import { User } from "@/types/User";

export const runtime = "nodejs"; // ensure Node.js runtime

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const token = (await cookies()).get("whatsappfirebase")?.value;

  let decoded: { email?: string; uid?: string } = {};

  if (token) {
    try {
      decoded = jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { email?: string; uid?: string };
    } catch (e) {
      console.error("JWT verification failed:", e);
    }
  }

  const finalUid = uid || decoded.uid;
  if (!finalUid) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ Create an SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const dbref = ref(database, "chats");

      // 2 Queries — one where user is email1 and one where user is email2
      const queryEmail1 = query(dbref, orderByChild("uid1"), equalTo(finalUid));
      const queryEmail2 = query(dbref, orderByChild("uid2"), equalTo(finalUid));

      const processSnapshots = (snapshot1: any, snapshot2: any) => {
        const data1 = snapshot1.exists() ? snapshot1.val() : {};
        const data2 = snapshot2.exists() ? snapshot2.val() : {};

        const keys1 = Object.keys(data1);
        const keys2 = Object.keys(data2);

        const ids = [...keys1, ...keys2];
        const arr1 = Object.values(data1);
        const arr2 = Object.values(data2);

        const finalArray = [...arr1, ...arr2].map((chat, index) => ({
          ...(chat as User),
          chatId: ids[index],
        }));

        const payload = JSON.stringify({ chats: finalArray });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      // Get initial snapshots once
      const [snap1, snap2] = await Promise.all([
        import("firebase/database").then(({ get }) => get(queryEmail1)),
        import("firebase/database").then(({ get }) => get(queryEmail2)),
      ]);

      processSnapshots(snap1, snap2);

      // Live updates using onValue()
      const listener1 = onValue(queryEmail1, (snap1) => {
        import("firebase/database").then(({ get }) =>
          get(queryEmail2).then((snap2) => processSnapshots(snap1, snap2))
        );
      });

      const listener2 = onValue(queryEmail2, (snap2) => {
        import("firebase/database").then(({ get }) =>
          get(queryEmail1).then((snap1) => processSnapshots(snap1, snap2))
        );
      });

      // Keep-alive signal every 20s
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 20000);

      // Cleanup on connection close
      const close = () => {
        clearInterval(interval);
        off(queryEmail1, "value", listener1);
        off(queryEmail2, "value", listener2);
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
      "Access-Control-Allow-Origin": "*", // allow local frontend
    },
  });
}
