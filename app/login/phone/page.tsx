"use client";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginGooglePage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL,
          fullName: user.displayName,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error);
      }

      router.push("/");
      // You can handle user session here
    } catch (error) {
      setError((error as Error).message);
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <section className="rounded-2xl border p-6">
        <h1 className="text-center text-2xl font-semibold">
          Sign in with Google
        </h1>
        <div className="flex justify-center mt-6 flex-col items-center gap-3">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full max-w-md rounded-full border px-8 py-4 text-base shadow-sm bg-card text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <FcGoogle size={28} />
            <span>Sign in with Google</span>
          </button>
          {/* Show error if exists */}
          {error && (
            <p className="mt-2 max-w-md text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground mt-auto">
        Your personal messages are end-to-end encrypted
      </footer>
    </main>
  );
}
