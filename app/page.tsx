"use client";
import { SideNav } from "@/components/whatsapp/side-nav";
import { ChatList } from "@/components/whatsapp/chat-list";
import { ChatView } from "@/components/whatsapp/chat-view";
import { useState } from "react";
import { ChatUser } from "@/types/User";

export default function Page() {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Hide sidebar on mobile */}
      <div className="hidden md:block">
        <SideNav />
      </div>

      {/* Show chat list on mobile when no chat selected, always show on desktop */}
      <div
        className={`${
          selectedChat ? "hidden md:block" : "block"
        } w-full md:w-auto`}
      >
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      {/* Show chat view when chat selected on mobile, always show on desktop */}
      <div
        className={`${
          selectedChat ? "block" : "hidden md:block"
        } w-full md:flex-1`}
      >
        <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </main>
  );
}
