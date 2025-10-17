"use client";

import { User } from "@/types/User";
import { Search } from "lucide-react";
import { addTransitionType, useEffect, useState } from "react";
import { toast } from "sonner";

export function SearchInput(props: { placeholder?: string }) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | undefined>();
  const [uid, setuid] = useState<string | null>();

  useEffect(() => {
    const timeOut = setTimeout(async () => {
      if (!email) {
        setUser(undefined);
        return;
      }
      try {
        const response = await fetch("/api/v1/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log(data);

        // Extract the first user object from the response
        if (data.user) {
          setUser(data.user as User);
        } else {
          setUser(undefined);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(undefined);
      }
    }, 500);

    return () => clearTimeout(timeOut);
  }, [email]);

  useEffect(() => {
    if (typeof window != "undefined") {
      const uid = localStorage.getItem("uid");
      setuid(uid);
    }
  }, []);
  // handle add chat event
  const handleAddChat = async () => {
    try {
      const toastId = toast.loading("Adding...");
      const response = await fetch("/api/v1/addChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          uid: user?.uid,
          fullName: user?.fullName,
          photoURL: user?.photoURL,
          currentUid: uid,
        }),
      });
      if (response.ok) {
        toast.dismiss(toastId);
        setEmail("");
      }
    } catch (error) {
      console.log(error as Error);
    }
  };
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Search"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder={props.placeholder ?? "Search or start a new chat"}
          className="w-full rounded-full border bg-secondary/60 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-brand)]"
        />
      </div>
      {user?.email && (
        <button onClick={handleAddChat} className="w-full">
          <div className="mt-2 flex items-center gap-3 w-full">
            <img
              src={user.photoURL}
              alt="user dp"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-left">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
