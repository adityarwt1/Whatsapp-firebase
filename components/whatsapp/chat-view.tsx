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
  timestamp: string;
  text: string;
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
  const prevMessagesLengthRef = useRef<number>(0);

  // Smart auto-scroll - only when user is at bottom or sends message
  useEffect(() => {
    // Only scroll if new messages were added AND user is at bottom
    if (
      messages.length > prevMessagesLengthRef.current &&
      isAtBottom &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isAtBottom]);

  // Track if user is at bottom of chat
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const threshold = 100; // pixels from bottom to consider "at bottom"
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setIsAtBottom(distanceFromBottom < threshold);
  };

  // Get current user UID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("uid");
      setCurrentUserUid(uid);
    }
  }, []);

  // Extract firstKey from chat
  const firstKey = chat ? Object.keys(chat)[0] : undefined;

  // Setup EventSource for real-time updates
  useEffect(() => {
    if (!currentUserUid || !firstKey) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `/api/v1/getCurrentChat?parentPathuid=${currentUserUid}&childPathuid=${firstKey}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("Received data:", parsedData);

        if (parsedData?.definedChat) {
          const extractedMessages: Message[] = [];

          parsedData.definedChat.forEach((userObj: any) => {
            const uid = Object.keys(userObj)[0];
            const messagesArray = userObj[uid];

            messagesArray.forEach((text: string) => {
              extractedMessages.push({
                timestamp: Date.now().toString(),
                text: text,
                uid: uid,
              });
            });
          });

          setMessages((prevMessages) => {
            const allMessages = [...prevMessages, ...extractedMessages];

            const uniqueMessages = allMessages.filter(
              (msg, index, self) =>
                index ===
                self.findIndex(
                  (m) =>
                    m.text === msg.text &&
                    m.uid === msg.uid &&
                    m.timestamp === msg.timestamp
                )
            );

            return uniqueMessages.sort(
              (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
            );
          });
        }
      } catch (error) {
        console.log("Error parsing SSE data:", (error as Error).message);
      }
    };

    eventSource.onerror = (error) => {
      console.log("Error fetching current chat:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [firstKey, currentUserUid]);

  // Extract and sort messages from initial chat prop
  useEffect(() => {
    if (!chat) return;

    const extractedMessages: Message[] = [];

    Object.keys(chat).forEach((key) => {
      if (
        typeof chat[key] === "object" &&
        key !== "email" &&
        key !== "fullName" &&
        key !== "photoURL" &&
        key !== "lastmessage" &&
        key !== "unseen"
      ) {
        const userMessages = chat[key];

        Object.keys(userMessages).forEach((timestamp) => {
          extractedMessages.push({
            timestamp,
            text: userMessages[timestamp],
            uid: key.trim(),
          });
        });
      }
    });

    const sortedMessages = extractedMessages.sort(
      (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
    );

    setMessages(sortedMessages);
  }, [chat]);

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date for date chip
  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
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
      const dateKey = formatDate(msg.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  // Optimistic message sending - WhatsApp style
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUserUid || !firstKey) return;

    const messageToSend = message.trim();
    const optimisticMessage: Message = {
      text: messageToSend,
      timestamp: String(Date.now()),
      uid: currentUserUid,
    };

    // Force scroll to bottom when sending
    setIsAtBottom(true);

    // Immediately add message to UI (optimistic update)
    setMessages((prev) => [...prev, optimisticMessage]);

    // Clear input immediately for better UX
    setMessage("");
    setIsSending(true);

    try {
      // Send to backend in background
      const response = await fetch("/api/v1/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          parentPath: currentUserUid,
          childPath: firstKey,
          currentUid: currentUserUid,
        }),
      });

      if (!response.ok) {
        // If API fails, remove the optimistic message
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              !(
                msg.text === optimisticMessage.text &&
                msg.timestamp === optimisticMessage.timestamp
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
              msg.text === optimisticMessage.text &&
              msg.timestamp === optimisticMessage.timestamp
            )
        )
      );
      console.log((error as Error).message);
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

  return (
    <div className="flex h-screen flex-1 flex-col bg-card">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <div className="min-w-0 flex items-center">
            <Image
              src={chat?.photoURL || "/backup.png"}
              alt="No dp"
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
        className="relative flex-1 overflow-y-auto p-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/images/whatsapp-chat-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px",
          backgroundPosition: "center",
        }}
        aria-label="Conversation"
      >
        {/* Render messages grouped by date */}
        {Object.keys(groupedMessages).map((date, index) => (
          <div key={index}>
            {/* Date chip */}
            <div className="mx-auto mb-6 w-max rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {date}
            </div>

            {/* Messages for this date */}
            {groupedMessages[date].map((message, msgIndex) => {
              const isCurrentUser = message.uid === currentUserUid;

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
                    {message.text}
                    <span className="ml-2 align-baseline text-[10px] opacity-80">
                      {formatTime(message.timestamp)}
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
