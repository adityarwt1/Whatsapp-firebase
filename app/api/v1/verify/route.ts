import { cookies } from "next/headers";
import jsonwebtoken from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("whatsappfirebase")?.value;

    if (!token) {
      const url = new URL("/login/phone", req.url);
      return NextResponse.redirect(url);
    }

    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { exp: number; uid: string };

    console.log("the decode value of the token", decoded);

    if (new Date(decoded.exp * 1000) < new Date()) {
      const url = new URL("/login/phone", req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.json(
      { message: "User authenticated" },
      { status: 200 }
    );
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { error: "Internal server issue" },
      { status: 500 }
    );
  }
}
