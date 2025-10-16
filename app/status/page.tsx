import { SideNav } from "@/components/whatsapp/side-nav"
import { SearchInput } from "@/components/whatsapp/search-input"
import Image from "next/image"

export default function StatusPage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Status</header>
        <div className="px-3">
          <SearchInput placeholder="Search status" />
        </div>
        <ul className="mt-3">
          <li className="flex items-center gap-3 px-3 py-3">
            <Image alt="" src="/diverse-avatars.png" width={40} height={40} className="rounded-full" />
            <div>
              <div className="text-sm font-medium">My status</div>
              <div className="text-xs text-muted-foreground">Click to add status update</div>
            </div>
          </li>
        </ul>
        <div className="mt-auto border-t px-3 py-2 text-xs text-muted-foreground">
          Your status updates are end-to-end encrypted
        </div>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center bg-card">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <h1 className="text-2xl font-semibold tracking-tight">Share status updates</h1>
          <p className="mt-2 text-muted-foreground">Share photos, videos and text that disappear after 24 hours.</p>
          <div className="mt-10 text-xs text-muted-foreground">Your status updates are end-to-end encrypted</div>
        </div>
      </div>
    </main>
  )
}
