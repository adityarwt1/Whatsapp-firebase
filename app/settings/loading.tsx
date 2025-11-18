import { SideNav } from "@/components/whatsapp/side-nav";
import {
  Bell,
  Lock,
  MessageSquare,
  Keyboard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Settings</header>
        <ul className="divide-y">
          <li className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </li>
          {[
            { icon: Lock, label: "Privacy" },
            { icon: MessageSquare, label: "Chats" },
            { icon: Bell, label: "Notifications" },
            { icon: Keyboard, label: "Keyboard shortcuts" },
            { icon: HelpCircle, label: "Help" },
            { icon: LogOut, label: "Log out", danger: true },
          ].map(({ icon: Icon, label, danger }) => (
            <li
              key={label}
              className={`flex items-center gap-3 px-4 py-3 ${
                danger ? "text-red-500" : ""
              }`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 flex-1 max-w-[160px]" />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <Skeleton className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <Skeleton className="mx-auto h-6 w-32" />
        </div>
      </div>
    </main>
  );
}
