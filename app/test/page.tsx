// "use client";
// import { database } from "@/lib/firebase";
// import { equalTo, get, orderByChild, query, ref } from "firebase/database";
// import React, { useEffect } from "react";

// const Page = () => {
//   useEffect(() => {
//     const search = async () => {
//       const dbref = ref(database, "chats");

//       // 🔍 Query 1: user is in email2
//       const queryUser = query(
//         dbref,
//         orderByChild("email2"),
//         equalTo("adityarawatnew2487@gmail.com")
//       );

//       // 🔍 Query 2: user is in email1
//       const queryFromSecond = query(
//         dbref,
//         orderByChild("email1"),
//         equalTo("adityarawatnew2487@gmail.com")
//       );

//       const snapshot = await get(queryUser);
//       const snapshot2 = await get(queryFromSecond);

//       if (!snapshot.exists() && !snapshot2.exists()) {
//         console.log("No chats found for this user.");
//         return;
//       }

//       // ✅ Get actual data and their keys (chat IDs)
//       const data = snapshot.exists() ? snapshot.val() : {};
//       const data2 = snapshot2.exists() ? snapshot2.val() : {};

//       const keys = Object.keys(data);
//       const keys2 = Object.keys(data2);

//       const ids = [...keys, ...keys2];

//       // Convert Firebase object data to array form
//       const arr1 = Object.values(data);
//       const arr2 = Object.values(data2);

//       // ✅ Merge both results and attach chatId to each chat
//       const finalArray = [...arr1, ...arr2].map((chat, index) => ({
//         ...chat,
//         chatId: ids[index],
//       }));

//       console.log("✅ Final Chats Array:", finalArray);
//     };

//     search();
//   }, []);

//   return <div>page</div>;
// };

// export default Page;
"use client";
import { database } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import React, { useEffect } from "react";

const page = () => {
  useEffect(() => {
    const getchat = async () => {
      const dbref = ref(database, "/messages/-ObgOlQEuRVej0c1M1Rm");
      const snapshot = await get(dbref);
      console.log(snapshot.val());
      console.log(Object.values(snapshot.val()));
    };
    getchat();
  }, []);
  return <div></div>;
};

export default page;
