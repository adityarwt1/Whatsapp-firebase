import { SideNav } from "@/components/whatsapp/side-nav"

const channels = [
  { name: "Telangana Weatherman", followers: "1.1M" },
  { name: "Tanya Love", followers: "1M" },
  { name: "Thanthi TV", followers: "467K" },
  { name: "WhatsApp", followers: "229.4M" },
  { name: "Kajal", followers: "697K" },
]

export default function ChannelsPage() {
  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Channels</header>
        <div className="px-4 pt-2 text-sm text-muted-foreground">Stay updated on your favorite topics</div>
        <ul className="mt-4 flex-1 overflow-y-auto">
          {channels.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/60">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.followers} followers</div>
              </div>
              <button className="rounded-full bg-[color:var(--color-brand)] px-3 py-1 text-sm text-[color:var(--color-brand-foreground)]">
                Follow
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t px-4 py-3">
          <button className="rounded-full bg-[color:var(--color-brand)] px-3 py-2 text-sm text-[color:var(--color-brand-foreground)]">
            Discover more
          </button>
        </div>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-semibold">Discover channels</h1>
          <p className="mt-2 text-muted-foreground">
            Entertainment, sports, news, lifestyle, people and more. Follow the channels that interest you.
          </p>
        </div>
      </div>
    </main>
  )
}
