"use client";

import { createContext } from "react";

interface isOnline {
  isOnline: boolean;
}

export const isOnline = createContext<isOnline>();
