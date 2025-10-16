"use client";

import { ChatUser } from "@/types/User";
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Plus,
  Send,
  Loader,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

interface ChatViewProps {
  chat: ChatUser | null;
}

interface Message {
  message: string;
  sendAt: number;
  uid: string;
}

export function ChatView({ chat }: ChatViewProps) {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  // Auto-scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Track if user is at bottom of chat
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const threshold = 100;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setIsAtBottom(distanceFromBottom < threshold);
  };

  // Get current user UID
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("uid");
      setCurrentUserUid(uid);
      console.log("Current user UID:", uid); // Debug log
    }
  }, []);

  // Setup EventSource for real-time messages
  useEffect(() => {
    if (!currentUserUid || !chat?.chatId) {
      console.log("Missing requirements:", {
        currentUserUid,
        chatId: chat?.chatId,
      });
      setMessages([]);
      return;
    }

    // Close previous connection
    if (eventSourceRef.current) {
      console.log("Closing previous EventSource connection");
      eventSourceRef.current.close();
    }

    console.log("Setting up EventSource for chat:", chat.chatId);
    const eventSource = new EventSource(
      `/api/v1/getCurrentChat?chatid=${chat.chatId}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("Received data:", parsedData);
        console.log("Type of parsedData:", typeof parsedData);
        console.log("Is Array:", Array.isArray(parsedData));

        // Check if parsedData is directly an array (based on your console log)
        if (Array.isArray(parsedData)) {
          console.log("Processing array directly");
          const sortedMessages = parsedData.sort(
            (a: Message, b: Message) => a.sendAt - b.sendAt
          );
          console.log("Setting messages:", sortedMessages);
          setMessages(sortedMessages);
        }
        // Check if it has definedChat property
        else if (
          parsedData?.definedChat &&
          Array.isArray(parsedData.definedChat)
        ) {
          console.log("Processing definedChat array");
          const sortedMessages = parsedData.definedChat.sort(
            (a: Message, b: Message) => a.sendAt - b.sendAt
          );
          console.log("Setting messages:", sortedMessages);
          setMessages(sortedMessages);
        } else {
          console.log("Data structure not recognized:", parsedData);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("EventSource connection opened");
    };

    return () => {
      console.log("Cleaning up EventSource");
      eventSource.close();
    };
  }, [chat?.chatId, currentUserUid]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log("Messages state updated:", messages);
    console.log("Messages length:", messages.length);
  }, [messages]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date for date chip
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};

    messages.forEach((msg) => {
      const dateKey = formatDate(msg.sendAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  // Send message with optimistic UI update
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUserUid || !chat?.chatId) return;

    const messageToSend = message.trim();
    const optimisticMessage: Message = {
      message: messageToSend,
      sendAt: Date.now(),
      uid: currentUserUid,
    };

    // Force scroll to bottom when sending
    setIsAtBottom(true);

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    // Clear input immediately
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/v1/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chat.chatId,
          message: messageToSend,
          uid: currentUserUid,
        }),
      });

      if (!response.ok) {
        // Remove optimistic message on failure
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              !(
                msg.message === optimisticMessage.message &&
                msg.sendAt === optimisticMessage.sendAt
              )
          )
        );
        console.error("Failed to send message");
      }
    } catch (error) {
      // Rollback on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            !(
              msg.message === optimisticMessage.message &&
              msg.sendAt === optimisticMessage.sendAt
            )
        )
      );
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  console.log("Rendering with:", {
    chatId: chat?.chatId,
    currentUserUid,
    messagesCount: messages.length,
    groupedMessagesKeys: Object.keys(groupedMessages),
  });

  return (
    <div className="flex h-screen flex-1 flex-col bg-card">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <div className="min-w-0 flex items-center">
            <Image
              src={chat?.photoURL || "/backup.png"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col mx-2">
              <div className="text-base font-medium">{chat?.fullName}</div>
              <div className="text-xs text-muted-foreground">
                last seen today at 18:21
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Video className="h-5 w-5" />
          <Phone className="h-5 w-5" />
          <Search className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
        </div>
      </header>

      {/* Messages area */}
      <main
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('/images/whatsapp-chat-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px",
          backgroundPosition: "center",
        }}
        aria-label="Conversation"
      >
        {/* Debug info (remove after fixing) */}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm">
            No messages yet. Messages count: {messages.length}
          </div>
        )}

        {/* Render messages grouped by date */}
        {Object.keys(groupedMessages).map((date, index) => (
          <div key={index}>
            {/* Date chip */}
            <div className="mx-auto mb-6 w-max rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {date}
            </div>

            {/* Messages for this date */}
            {groupedMessages[date].map((msg, msgIndex) => {
              const isCurrentUser = msg.uid === currentUserUid;

              return (
                <div
                  key={msgIndex}
                  className={`mb-3 flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] rounded-lg px-3 py-2 text-sm ${
                      isCurrentUser
                        ? "bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)]"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {msg.message}
                    <span className="ml-2 align-baseline text-[10px] opacity-80">
                      {formatTime(msg.sendAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Invisible div for auto-scroll target */}
        <div ref={messagesEndRef} />
      </main>

      {/* Composer */}
      <footer className="flex items-center gap-2 border-t bg-card px-4 py-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full border bg-secondary/60 px-3">
          <input
            disabled={isSending}
            aria-label="Type a message"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            value={message}
            placeholder="Type a message"
            className="flex-1 bg-transparent py-2 text-sm outline-none"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] disabled:opacity-50"
        >
          {isSending ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </footer>
    </div>
  );
}
