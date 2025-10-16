import { SideNav } from "@/components/whatsapp/side-nav"
import { Bell, Lock, MessageSquare, Keyboard, HelpCircle, LogOut } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Settings</header>
        <ul className="divide-y">
          <li className="flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-secondary" />
            <div>
              <div className="text-sm font-medium">Your Name</div>
              <div className="text-xs text-muted-foreground">Hey there! I am using WhatsApp.</div>
            </div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">Privacy</div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">Chats</div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">Notifications</div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">Keyboard shortcuts</div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">Help</div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3 text-red-500">
            <LogOut className="h-4 w-4" />
            <div className="text-sm">Log out</div>
          </li>
        </ul>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </div>
    </main>
  )
}
