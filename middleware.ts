import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = (await cookies()).get("whatsappfirebase")?.value;

  const response = await fetch(`${req.nextUrl.origin}/api/v1/verify`);
  if (!response.ok) {
    const url = new URL("/login/phone", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
