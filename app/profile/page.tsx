import { SideNav } from "@/components/whatsapp/side-nav"
import { Pencil, Phone } from "lucide-react"

export default function ProfilePage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Profile</header>
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <div className="grid place-items-center rounded-full bg-secondary" style={{ width: 120, height: 120 }}>
            <span className="text-xs text-muted-foreground">Add profile photo</span>
          </div>
        </div>
        <ul className="space-y-4 px-6">
          <li className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="text-sm">Your Name</div>
            </div>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </li>
          <li className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">About</div>
              <div className="text-sm">Hey there! I am using WhatsApp.</div>
            </div>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </li>
          <li className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" /> +91 00000 00000
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
      </div>
    </main>
  )
}
