import { database } from "@/lib/firebase";
import { off, onValue, ref } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const parentPath = req.nextUrl.searchParams.get("parentPathuid") || "";
    const childPath = req.nextUrl.searchParams.get("childPathuid") || "";

    ///validating data
    if (!parentPath || !childPath) {
      return NextResponse.json({ error: "Badrequest" }, { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const encode = new TextEncoder();
        const dbref = ref(database, `/chats/${parentPath}/${childPath}`);

        /// intilizing where sttreaming happend
        const listener = onValue(
          dbref,
          (snapshot) => {
            const extratedData = snapshot.val();

            // Get the actual UID keys
            const uidFirst = Object.keys(extratedData)[0];
            const uidSecond = Object.keys(extratedData)[1];

            // Get chat arrays
            const chat1 = Object.values(extratedData[uidFirst]);
            const chat2 = Object.values(extratedData[uidSecond]);

            // Use dynamic property names with bracket notation
            const definedChat = [
              {
                [uidFirst]: chat1, // Dynamic key using actual UID
              },
              {
                [uidSecond]: chat2, // Dynamic key using actual UID
              },
            ];
            console.log("defined chat", definedChat);

            const payLoad = JSON.stringify({ definedChat });
            controller.enqueue(encode.encode(`data: ${payLoad}\n\n`));
          },
          (error) => {
            controller.enqueue(
              encode.encode(`event: error\ndata: ${error.message}\n\n`)
            );
          }
        );

        //intervale to make the connection keeep alive
        const interval = setInterval(() => {
          controller.enqueue(encode.encode(`: keep-alive\n\n`));
        }, 2000);

        // cleanupo connection close
        const close = () => {
          clearInterval(interval);
          off(dbref, "value", listener);
          controller.close();
        };

        /// finaly when request no more
        req.signal.addEventListener("abort", close);
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
