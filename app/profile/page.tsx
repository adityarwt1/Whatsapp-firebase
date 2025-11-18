"use client";

import { SideNav } from "@/components/whatsapp/side-nav";
import { Pencil, Phone, Camera, ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfilePage() {
  const [uid, setUid] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    fullName: string;
    about: string;
    phone: string;
    photoURL: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempAbout, setTempAbout] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUid = localStorage.getItem("uid");
      setUid(storedUid);
    }
  }, []);

  useEffect(() => {
    if (!uid) return;

    const eventSource = new EventSource(`/api/v1/getUserInfo?uid=${uid}`);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.user) {
          setUserData({
            fullName: parsed.user.fullName || "Your Name",
            about: parsed.user.about || "Hey there! I am using WhatsApp.",
            phone: parsed.user.phone || "+91 00000 00000",
            photoURL: parsed.user.photoURL || "",
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [uid]);

  const handleNameEdit = () => {
    setTempName(userData?.fullName || "");
    setEditingName(true);
  };

  const handleAboutEdit = () => {
    setTempAbout(userData?.about || "");
    setEditingAbout(true);
  };

  const saveName = async () => {
    if (!uid || !tempName.trim()) return;

    try {
      const response = await fetch("/api/v1/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          fullName: tempName.trim(),
        }),
      });

      if (response.ok) {
        setUserData((prev) =>
          prev ? { ...prev, fullName: tempName.trim() } : null
        );
        setEditingName(false);
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const saveAbout = async () => {
    if (!uid || !tempAbout.trim()) return;

    try {
      const response = await fetch("/api/v1/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          about: tempAbout.trim(),
        }),
      });

      if (response.ok) {
        setUserData((prev) =>
          prev ? { ...prev, about: tempAbout.trim() } : null
        );
        setEditingAbout(false);
      }
    } catch (error) {
      console.error("Error updating about:", error);
    }
  };

  const base64Format = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    try {
      setUploading(true);
      const base64Image = await base64Format(file);
      toast.message("Updating dp....");
      const response = await fetch("/api/v1/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          photoURL: base64Image,
        }),
      });

      if (response.ok) {
        toast.message("DP updated successfully!");
        setUserData((prev) =>
          prev ? { ...prev, photoURL: base64Image } : null
        );
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Hide sidebar on mobile */}
      <div className="hidden md:block">
        <SideNav />
      </div>

      <div className="flex h-screen w-full md:w-[360px] flex-col border-r bg-card">
        <header className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="md:hidden flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-lg font-semibold">Profile</div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 px-4 py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="relative">
                <div
                  className="grid place-items-center rounded-full bg-secondary overflow-hidden"
                  style={{ width: 120, height: 120 }}
                >
                  {userData?.photoURL ? (
                    <Image
                      src={userData.photoURL}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Add profile photo
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] p-2 rounded-full hover:opacity-90 disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ul className="space-y-4 px-6">
              {/* Name */}
              <li className="flex items-center justify-between gap-3 py-2 border-b">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Name</div>
                  {editingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      autoFocus
                      className="text-sm bg-transparent border-none outline-none w-full"
                    />
                  ) : (
                    <div className="text-sm">{userData?.fullName}</div>
                  )}
                </div>
                {!editingName && (
                  <button onClick={handleNameEdit}>
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </li>

              {/* About */}
              <li className="flex items-center justify-between gap-3 py-2 border-b">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    About
                  </div>
                  {editingAbout ? (
                    <input
                      type="text"
                      value={tempAbout}
                      onChange={(e) => setTempAbout(e.target.value)}
                      onBlur={saveAbout}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveAbout();
                        if (e.key === "Escape") setEditingAbout(false);
                      }}
                      autoFocus
                      className="text-sm bg-transparent border-none outline-none w-full"
                    />
                  ) : (
                    <div className="text-sm">{userData?.about}</div>
                  )}
                </div>
                {!editingAbout && (
                  <button onClick={handleAboutEdit}>
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </li>

              {/* Phone */}
              <li className="flex items-center justify-between gap-3 py-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Phone
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />{" "}
                    {userData?.phone}
                  </div>
                </div>
              </li>
            </ul>
          </>
        )}
      </div>

      <div className="hidden md:flex h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40" />
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
      </div>
    </main>
  );
}
