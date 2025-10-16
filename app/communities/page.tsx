import { SideNav } from "@/components/whatsapp/side-nav"

export default function CommunitiesPage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Communities</header>
        <div className="p-4">
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="text-base font-semibold">Stay connected with a community</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Communities bring members together in topic-based groups and make announcements easy.
            </p>
            <button className="mt-3 rounded-full bg-[color:var(--color-brand)] px-3 py-2 text-sm text-[color:var(--color-brand-foreground)]">
              Start your community
            </button>
          </div>
        </div>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-semibold">Create communities</h1>
          <p className="mt-2 text-muted-foreground">
            Bring members together in topic-based groups and easily send them admin announcements.
          </p>
        </div>
      </div>
    </main>
  )
}
