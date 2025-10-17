import { database } from "@/lib/firebase";
import { connnectdb } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { ref, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { fullName, about, photoURL, uid } = await req.json();

    // Validate uid
    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connnectdb();
    const user = await UserModel.findOne({ uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update objects
    const mongoUpdate: any = {};
    const firebaseUpdate: any = {};

    // Update fullName if provided
    if (fullName !== undefined && fullName.trim() !== "") {
      mongoUpdate.fullName = fullName.trim();
      firebaseUpdate.fullName = fullName.trim();
    }

    // Update about if provided
    if (about !== undefined && about.trim() !== "") {
      mongoUpdate.about = about.trim();
      firebaseUpdate.about = about.trim();
    }

    // Update photoURL if provided
    if (photoURL !== undefined && photoURL.trim() !== "") {
      mongoUpdate.photoURL = photoURL.trim();
      firebaseUpdate.photoURL = photoURL.trim();
    }

    // Check if there's anything to update
    if (Object.keys(mongoUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update in MongoDB
    await UserModel.updateOne({ uid }, { $set: mongoUpdate });

    // Update in Firebase Realtime Database
    const userRef = ref(database, `/users/${uid}`);
    await update(userRef, firebaseUpdate);

    return NextResponse.json(
      {
        message: "Profile updated successfully!",
        updated: Object.keys(mongoUpdate),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
