"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MoodState } from "@/app/actions/mood";

type MoodContextValue = {
  state: MoodState;
  setState: (state: MoodState | null) => void;
};

const MoodContext = createContext<MoodContextValue | null>(null);

export function MoodProvider({
  initialState,
  children,
}: {
  initialState: MoodState;
  children: ReactNode;
}) {
  const [state, setStateRaw] = useState(initialState);
  const setState = (next: MoodState | null) => {
    if (next) setStateRaw(next);
  };

  return <MoodContext.Provider value={{ state, setState }}>{children}</MoodContext.Provider>;
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within a MoodProvider");
  return ctx;
}
