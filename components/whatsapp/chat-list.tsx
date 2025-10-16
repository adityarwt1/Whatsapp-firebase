"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";
import { useEffect, useState } from "react";
import { ChatUser } from "@/types/User";

const tabs = ["All", "Unread", "Favorites", "Groups"] as const;

interface ChatListProps {
  onSelectChat: (chat: ChatUser) => void;
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("uid");
      setUid(uid);
    }
  }, []);

  useEffect(() => {
    if (!uid) return;

    const eventSource = new EventSource(`/api/v1/getChats?uid=${uid}`);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.chats) {
          setChats(parsed.chats);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse SSE data", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [uid]);

  return (
    <div className="flex h-screen w-[360px] flex-col border-r bg-card">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="text-xl font-semibold">WhatsApp</div>
      </header>

      {/* Search Input */}
      <div className="px-3 pb-3">
        <SearchInput />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-3 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              t === "All"
                ? "bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)]"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <ul className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-5">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-5">
            No chats found
          </div>
        ) : (
          chats.map((chat) => (
            <button
              onClick={() => onSelectChat(chat)}
              key={chat.uid}
              className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-secondary/60 w-full"
            >
              <Image
                alt={chat.fullName}
                src={chat.photoURL || "/placeholder.svg?height=40&width=40"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {chat.fullName}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground text-left">
                  {chat.lastmessage || "Start Chat"}
                </div>
              </div>
            </button>
          ))
        )}
      </ul>

      {/* Footer */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Your personal messages are end-to-end encrypted
      </div>
    </div>
  );
}
