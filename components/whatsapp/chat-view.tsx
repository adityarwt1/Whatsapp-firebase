"use client";

import { ChatUser } from "@/types/User";
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Send,
  Loader,
  MessageCircle,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

interface ChatViewProps {
  chat: ChatUser | null;
  onBack?: () => void;
}

interface Message {
  message: string;
  sendAt: number;
  uid: string;
  image?: string;
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
export function ChatView({ chat, onBack }: ChatViewProps) {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [online, setLastOnline] = useState<string>();
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const threshold = 100;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setIsAtBottom(distanceFromBottom < threshold);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("uid");
      setCurrentUserUid(uid);
    }
  }, []);

  useEffect(() => {
    if (!currentUserUid || !chat?.chatId) {
      setMessages([]);
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `/api/v1/getCurrentChat?chatid=${chat.chatId}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (Array.isArray(parsedData)) {
          const sortedMessages = parsedData.sort(
            (a: Message, b: Message) => a.sendAt - b.sendAt
          );
          setMessages(sortedMessages);
        } else if (
          parsedData?.definedChat &&
          Array.isArray(parsedData.definedChat)
        ) {
          const sortedMessages = parsedData.definedChat.sort(
            (a: Message, b: Message) => a.sendAt - b.sendAt
          );
          setMessages(sortedMessages);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    const userOnlineEventsource = new EventSource(
      `/api/v1/getUserInfo?uid=${chat.uid}`
    );

    userOnlineEventsource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      if (parsed.user) {
        setLastOnline(lastSeenFormat(parsed.user.lastOnline));
      }
    };
    userOnlineEventsource.onerror = (error) => {
      console.log(error);
    };
    return () => {
      eventSource.close();
      userOnlineEventsource.close();
    };
  }, [chat?.chatId, currentUserUid, chat?.uid]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

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

  const base64Format = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && currentUserUid && chat?.chatId) {
      try {
        setIsSending(true);
        const base64Image = await base64Format(file);

        const response = await fetch("/api/v1/sendMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currentUserUid,
            chatId: chat.chatId,
            image: base64Image,
            imageText: message.trim() || "Image",
          }),
        });

        if (response.ok) {
          setMessage("");
          setIsAtBottom(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
      } catch (error) {
        console.error("Error sending image:", error);
      } finally {
        setIsSending(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // handle last seen
  const lastSeenFormat = (timestamp: number): string => {
    const seenAt = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() + 1);
    if (seenAt.toLocaleDateString() == today.toLocaleDateString()) {
      return `last seen today at ${seenAt.toLocaleTimeString()}`;
    } else if (seenAt.toLocaleDateString() == yesterday.toLocaleTimeString()) {
      return `last seent yesterday at ${seenAt.toLocaleTimeString()}`;
    } else if (
      seenAt.toLocaleDateString() <
      new Date(today.getTime() + 7).toLocaleDateString()
    ) {
      return `last seen this week in ${seenAt.getDay()}`;
    } else {
      return `last seen ${seenAt.toLocaleDateString()}`;
    }
  };
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUserUid || !chat?.chatId) return;

    const messageToSend = message.trim();
    const optimisticMessage: Message = {
      message: messageToSend,
      sendAt: Date.now(),
      uid: currentUserUid,
    };

    setIsAtBottom(true);
    setMessages((prev) => [...prev, optimisticMessage]);
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const deleteRead = async () => {
      try {
        await fetch(`/api/v1/delteUnread`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId: chat?.chatId, uid: currentUserUid }),
        });
      } catch (error) {
        console.log((error as Error).message);
      }
    };
    deleteRead();
  }, [chat, currentUserUid]);

  if (!chat) {
    return (
      <div className="flex h-screen flex-1 flex-col items-center justify-center bg-card">
        <div className="flex flex-col items-center justify-center max-w-md text-center px-6">
          <div className="mb-6 rounded-full bg-primary/10 p-8">
            <MessageCircle className="h-20 w-20 text-primary" />
          </div>

          <h1 className="text-3xl font-semibold mb-3">WhatsApp Clone</h1>

          <p className="text-muted-foreground mb-6 text-base">
            Select a conversation from the sidebar to start chatting
          </p>

          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <p>Made with by Aditya Rawat</p>

            <div className="flex gap-4 items-center">
              <a
                href="https://github.com/adityarwt1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>

              <span className="text-muted-foreground/50">•</span>

              <a
                href="https://www.linkedin.com/in/aditya-rawat-3862182b0/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col bg-card">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Custom scrollbar for chat area */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.16);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.24);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <Image
              src={chat?.photoURL || "/backup.png"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <div className="text-sm md:text-base font-medium">
                {chat?.fullName}
              </div>
              <div className="text-xs text-muted-foreground">{online}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-muted-foreground">
          <Video className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
          <Phone className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
          <div className="hidden md:block">
            <Search className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
          </div>
          <MoreVertical className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </header>

      {/* Messages area with custom scrollbar */}
      <main
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('/images/whatsapp-chat-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px",
          backgroundPosition: "center",
        }}
        aria-label="Conversation"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground text-sm bg-secondary/50 px-6 py-4 rounded-lg">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}

        {/* Render messages grouped by date */}
        {Object.keys(groupedMessages).map((date, index) => (
          <div key={index}>
            {/* Date chip */}
            <div className="mx-auto mb-6 w-max rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {date}
            </div>

            {/* Messages for this date - WhatsApp Style */}
            {groupedMessages[date].map((msg, msgIndex) => {
              const isCurrentUser = msg.uid === currentUserUid;

              return (
                <div
                  key={msgIndex}
                  className={`mb-1 flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                      isCurrentUser
                        ? "bg-[#005C4B] text-white"
                        : "bg-[#202C33] text-white"
                    }`}
                  >
                    {/* Render image if present */}
                    {msg.image && (
                      <div className="mb-1 -mx-1 -mt-1">
                        <img
                          src={msg.image}
                          alt="Shared image"
                          className="rounded-t-md max-w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    )}

                    {/* Render message text with proper spacing for timestamp */}
                    {msg.message && (
                      <div
                        className="pr-16 leading-relaxed text-[14.2px] break-words"
                        style={{
                          textShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                        }}
                      >
                        {msg.message}
                      </div>
                    )}

                    {/* Time stamp positioned at bottom right */}
                    <span
                      className="absolute bottom-1 right-2 text-[11px] opacity-60 whitespace-nowrap flex items-center gap-1"
                      style={{
                        textShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                      }}
                    >
                      {formatTime(msg.sendAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </main>

      {/* Composer */}
      <footer className="flex items-center gap-2 border-t bg-card px-3 md:px-4 py-2 md:py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full border bg-secondary/60 px-3">
          <input
            ref={inputRef}
            disabled={isSending}
            aria-label="Type a message"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            value={message}
            placeholder="Type a message"
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100"
        >
          {isSending ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </button>
      </footer>
    </div>
  );
}
