"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Logout = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/v1/logout", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        router.replace("/login");
      }
      toast("Logout successfully!");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <button
      className="flex items-center gap-3 px-4 py-3 text-red-500"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      <div className="text-sm">Log out</div>
    </button>
  );
};

export default Logout;
