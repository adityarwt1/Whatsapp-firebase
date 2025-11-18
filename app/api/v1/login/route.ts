import { database } from "@/lib/firebase";
import { get, ref, serverTimestamp, set } from "firebase/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jsonwebtoken from "jsonwebtoken";
import { connnectdb } from "@/lib/mongodb";
import UserModel from "@/models/User";
export async function POST(req: NextRequest) {
  try {
    const { email, photoURL, fullName, uid } = await req.json();

    if (!email || !photoURL || !fullName || !uid) {
      return NextResponse.json(
        { error: "Email or fullname must be required" },
        { status: 400 }
      );
    }
    const token = jsonwebtoken.sign({ uid }, process.env.JWT_SECRET as string, {
      issuer: "Aditya Rawat",
      expiresIn: 7 * 24 * 60 * 60 * 100,
    });
    console.log("token", token);
    (await cookies()).set("whatsappfirebase", token);

    await connnectdb();

    const user = await UserModel.findOne({ email });

    if (!user) {
      const saveUser = await UserModel.insertOne({
        email,
        photoURL,
        uid,
        fullName,
        createdAt: new Date().getTime(),
      });
    }
    const dbREf = ref(database, `/users/${uid}`);
    const snapshot = await get(dbREf);

    if (!snapshot.exists()) {
      await set(dbREf, {
        fullName: fullName,
        email: email,
        photoURL: photoURL,
        uid: uid,
        createdAt: serverTimestamp(),
      });
    }

    return NextResponse.json(
      { message: "Login Successfully" },
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
