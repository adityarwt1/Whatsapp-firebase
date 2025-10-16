"use client";
import { SideNav } from "@/components/whatsapp/side-nav";
import { ChatList } from "@/components/whatsapp/chat-list";
import { ChatView } from "@/components/whatsapp/chat-view";
import { useState } from "react";
import { ChatUser } from "@/types/User";

export default function Page() {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);

  return (
    <main className="flex">
      <SideNav />
      {/* Pass selected chat handler */}
      <ChatList onSelectChat={setSelectedChat} />
      {/* Pass selected chat data */}
      <ChatView chat={selectedChat} />
    </main>
  );
}
