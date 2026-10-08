import type { DetailKey } from "./site";

type Product = {
  id: Exclude<DetailKey, "about">;
  slug: string;
  cover: string;
  coverAlt: string;
  label: string;
  slot: number;
  icon: "board" | "calendar" | "workspace";
};

export const products = [
  {
    id: "lattice", slug: "lattice-board", cover: "/assets/products/lattice-board.jpg",
    coverAlt: "Ivory note cards arranged in an architectural lattice", label: "Obsidian plugin", slot: 1, icon: "board",
  },
  {
    id: "weekly", slug: "weekly-schedule", cover: "/assets/products/weekly-schedule.jpg",
    coverAlt: "An open weekly planner on a graphite desk", label: "Obsidian plugin", slot: 0, icon: "calendar",
  },
  {
    id: "vibespace", slug: "vibespace", cover: "/assets/products/vibespace.jpg",
    coverAlt: "Smoked-glass workspace planes and silver task tiles", label: "AI workspace", slot: 2, icon: "workspace",
  },
] as const satisfies readonly Product[];
