"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";
import { useEffect, useState } from "react";
import { ChatUser } from "@/types/User";

const tabs = ["All", "Unread"] as const;
type Tab = (typeof tabs)[number];

interface ChatListProps {
  onSelectChat: (chat: ChatUser) => void;
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const today = new Date();
interface RawChatData {
  email1: string;
  email2: string;
  fullName1: string;
  fullname2: string;
  lastMessage: string;
  lastInteraction?: number;
  photoURL1: string;
  photoURL2: string;
  uid1: string;
  uid2: string;
  chatId: string;
  unread1?: number;
  unread2?: number;
}

interface ExtendedChatUser extends ChatUser {
  unreadCount: number;
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const [allChats, setAllChats] = useState<ExtendedChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");

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
          const transformedChats: ExtendedChatUser[] = parsed.chats.map(
            (chat: RawChatData) => {
              const isUser1 = chat.uid1 === uid;

              return {
                uid: isUser1 ? chat.uid2 : chat.uid1,
                fullName: isUser1 ? chat.fullname2 : chat.fullName1,
                email: isUser1 ? chat.email2 : chat.email1,
                photoURL: isUser1 ? chat.photoURL2 : chat.photoURL1,
                lastmessage: chat.lastMessage,
                lastInteraction: chat.lastInteraction,
                chatId: chat.chatId,
                unreadCount: isUser1 ? chat.unread1 || 0 : chat.unread2 || 0,
              };
            }
          );

          setAllChats(transformedChats);
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

  const handleChatSelect = async (chat: ExtendedChatUser) => {
    setSelectedChatId(chat.chatId);
    onSelectChat(chat);
    try {
      await fetch(`/api/v1/delteUnread`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: chat.chatId, uid: uid }),
      });
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const filteredChats =
    activeTab === "Unread"
      ? allChats.filter((chat) => chat.unreadCount > 0)
      : allChats;

  return (
    <div className="flex h-screen w-full md:w-[360px] flex-col border-r bg-card">
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
            onClick={() => setActiveTab(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              t === activeTab
                ? "bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)]"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
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
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-5">
            {activeTab === "Unread" ? "No unread chats" : "No chats found"}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              onClick={() => handleChatSelect(chat)}
              key={chat.chatId}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-3 py-3 w-full transition-colors",
                selectedChatId === chat.chatId
                  ? "bg-secondary/80"
                  : "hover:bg-secondary/50"
              )}
            >
              <div className="relative">
                <Image
                  alt={chat.fullName}
                  src={chat.photoURL || "/placeholder.svg?height=40&width=40"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {chat.unreadCount > 0 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {chat.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.lastInteraction).toLocaleDateString() ==
                    new Date().toLocaleDateString()
                      ? "Today"
                      : new Date(chat.lastInteraction).toLocaleDateString() <
                        new Date()
                          .setDate(new Date().getTime() + 7)
                          .toLocaleString()
                      ? days[new Date(chat.lastInteraction).getDay()]
                      : new Date(chat.lastInteraction).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs text-muted-foreground text-left flex-1">
                    {chat.lastmessage || "Start Chat"}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-green-500 text-white text-[11px] font-semibold rounded-full px-1.5">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </ul>

      {/* Footer */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground text-center">
        Your personal messages are end-to-end encrypted
      </div>
    </div>
  );
}
