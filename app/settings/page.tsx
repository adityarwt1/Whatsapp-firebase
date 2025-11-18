import { SideNav } from "@/components/whatsapp/side-nav";
import {
  Bell,
  Lock,
  MessageSquare,
  Keyboard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import Logout from "@/components/Logout";
export default async function SettingsPage() {
  const token = (await cookies()).get("whatsappfirebase")?.value as string;
  if (!token) {
    return redirect("/login");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    uid: string;
  };

  const databaseRef = ref(database, `/users/${decoded.uid}`);

  const snapshot = await get(databaseRef);
  const user = snapshot.val();

  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="flex">
      <SideNav />
      <div className="flex h-screen w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 text-lg font-semibold">Settings</header>
        <ul className="divide-y">
          <li className="flex items-center gap-3 px-4 py-3">
            <img
              src={user.photoURL}
              className="h-10 w-10 rounded-full bg-secondary"
              alt="dp"
            />
            <div />
            <div>
              <div className="text-sm font-medium">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.about}</div>
            </div>
          </li>

          <Logout />
        </ul>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </div>
    </main>
  );
}
