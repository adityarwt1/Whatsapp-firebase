"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageActiveChecker() {
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
          timeStam: active ? "online" : new Date().getTime(),
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
