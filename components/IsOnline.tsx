"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageActiveChecker() {
  function getLastSeenStatus(timeStamp: string | number): string {
    if (timeStamp === "online") return "online"; // or some online check

    const lastSeenDate = new Date(timeStamp);
    const now = new Date();

    const isToday =
      lastSeenDate.getDate() === now.getDate() &&
      lastSeenDate.getMonth() === now.getMonth() &&
      lastSeenDate.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      lastSeenDate.getDate() === yesterday.getDate() &&
      lastSeenDate.getMonth() === yesterday.getMonth() &&
      lastSeenDate.getFullYear() === yesterday.getFullYear();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    if (isToday) {
      return `last seen today at ${lastSeenDate.toLocaleTimeString(
        [],
        timeOptions
      )}`;
    } else if (isYesterday) {
      return `last seen yesterday at ${lastSeenDate.toLocaleTimeString(
        [],
        timeOptions
      )}`;
    } else {
      return `last seen on ${lastSeenDate.toLocaleDateString()} at ${lastSeenDate.toLocaleTimeString(
        [],
        timeOptions
      )}`;
    }
  }

  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUid = localStorage.getItem("uid");
      if (!storedUid) router.push("/login");
      setUid(storedUid);
    }
  }, [router]);

  useEffect(() => {
    if (!uid) return;

    const handleVisibilityChange = async () => {
      const active = !document.hidden;

      await fetch("/api/v1/setLastOnline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeStam: active ? "online" : getLastSeenStatus(new Date().getTime()),
          uid,
        }),
      });
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [uid]);

  return null;
}
