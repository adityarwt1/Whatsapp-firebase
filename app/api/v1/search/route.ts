import { database } from "@/lib/firebase";
import { connnectdb } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { equalTo, get, orderByChild, query, ref } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email must be required" },
        { status: 400 }
      );
    }

    const query = email;

    const filter: any = {};

    if (email) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    await connnectdb();
    const userRes = await UserModel.findOne(filter);

    if (userRes) {
      return NextResponse.json({ user: userRes }, { status: 200 });
    }
    const dbref = ref(database, "/users");
    const searchQuery = query(dbref, orderByChild("email"), equalTo(email));

    const snapshot = await get(searchQuery);

    if (!snapshot.exists()) {
      return NextResponse.json({ user: {} }, { status: 200 });
    }

    const data = snapshot.val();
    const userId = Object.keys(data)[0]; // first UID key
    const user = data[userId]; // actual user object

    return NextResponse.json(
      {
        user: {
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
