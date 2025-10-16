"use client";
import { database } from "@/lib/firebase";
import { equalTo, get, orderByChild, query, ref } from "firebase/database";
import React, { useEffect } from "react";

const page = () => {
  useEffect(() => {
    const search = async () => {
      const dbref = ref(database, "chats");
      const queryUser = query(
        dbref,
        orderByChild("email2"),
        equalTo("adityarawatnew2487@gmail.com")
      );

      const queryFromSecond = query(
        dbref,
        orderByChild("email1"),
        equalTo("adityarawatnew2487@gmail.com")
      );
      const snapshot = await get(queryUser);
      const snapshot2 = await get(queryFromSecond);
      const data = snapshot.val();
      const data2 = snapshot2.val();
      const keys = Object.keys(data);
      const keys2 = Object.keys(data2);
      console.log(keys);
      console.log(keys2);
      console.log(Object.values(data));
      console.log(Object.values(data2));
    };
    search();
  }, []);
  return <div>page</div>;
};

export default page;
