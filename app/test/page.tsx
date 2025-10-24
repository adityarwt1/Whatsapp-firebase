// "use client";
// import { useEffect, useState } from "react";

// export default function PageActiveChecker() {
//   const [isActive, setIsActive] = useState(true);

//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       const active = !document.hidden;
//       setIsActive(active);
//       console.log(active ? "🟢 Window is Active" : "🔴 Window is Inactive");
//     };

//     // Run once when mounted
//     handleVisibilityChange();

//     // Add listener for tab change
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     // Clean up
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, []);

//   return (
//     <div className="p-6 text-center text-xl font-semibold">
//       {isActive ? (
//         <span className="text-green-600">🟢 Window is Active</span>
//       ) : (
//         <span className="text-red-600">🔴 Window is Inactive</span>
//       )}
//     </div>
//   );

"use client";

import React from "react";

const Page = () => {
  const base64Format = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the first selected file

    if (file) {
      console.log("Selected Image File:", file);
      console.log("File Name:", file.name);
      console.log("File Type:", file.type);
      console.log("File Size (KB):", (file.size / 1024).toFixed(2));
      const url = await base64Format(file);
      console.log(url);

      if (url) {
        await fetch("/api/v1/sendMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: "SriQ8MuWRlRJ2sWjVm2seGkIyPI2",
            chatId: "-ObgQP_uqeMihoHmdyXu",
            image: url,
            imageText: "this is firs image",
          }),
        });
      }
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImage} />
    </div>
  );
};

export default Page;
