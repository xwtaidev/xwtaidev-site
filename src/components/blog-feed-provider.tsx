"use client";

import { createContext, useContext, useRef, useState, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react";
import type { BlogCategory } from "@/content/blog";

export const feedPageSize = 6;
export const initialFeedCount = 8;
type FeedState = { category: BlogCategory; query: string; visibleCount: number };
type FeedContextValue = { state: FeedState; setState: Dispatch<SetStateAction<FeedState>>; scrollPositionRef: RefObject<number> };
const FeedContext = createContext<FeedContextValue | null>(null);

export function BlogFeedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FeedState>({ category: "All", query: "", visibleCount: initialFeedCount });
  const scrollPositionRef = useRef(0);
  return <FeedContext.Provider value={{ state, setState, scrollPositionRef }}>{children}</FeedContext.Provider>;
}

export function useBlogFeed() {
  const context = useContext(FeedContext);
  if (!context) throw new Error("The article feed requires BlogFeedProvider.");
  return context;
}
