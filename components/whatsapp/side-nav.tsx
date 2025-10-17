"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageCircle, Settings, UserCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [{ href: "/", icon: MessageCircle, label: "Chats" }];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/profile", icon: UserCircle2, label: "Profile" },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-16 flex-col items-center justify-between border-r bg-sidebar py-4"
      aria-label="Primary"
    >
      <nav className="flex flex-col gap-4">
        <Link href="/" className="text-2xl font-semibold sr-only">
          WhatsApp
        </Link>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary",
                active && "text-[color:var(--color-brand)] bg-secondary"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
      <nav className="flex flex-col gap-3">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary",
                active && "text-[color:var(--color-brand)] bg-secondary"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
