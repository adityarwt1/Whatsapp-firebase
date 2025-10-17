"use client";
import { useEffect, useState } from "react";

export default function PageActiveChecker() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = !document.hidden;
      setIsActive(active);
      console.log(active ? "🟢 Window is Active" : "🔴 Window is Inactive");
    };

    // Run once when mounted
    handleVisibilityChange();

    // Add listener for tab change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="p-6 text-center text-xl font-semibold">
      {isActive ? (
        <span className="text-green-600">🟢 Window is Active</span>
      ) : (
        <span className="text-red-600">🔴 Window is Inactive</span>
      )}
    </div>
  );
}
