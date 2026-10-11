import type { DetailKey } from "./site";

type Product = {
  id: Exclude<DetailKey, "about">;
  cover: string;
  coverAlt: string;
  label: string;
  slot: number;
  icon: "board" | "calendar" | "workspace";
};

export const products = [
  {
    id: "lattice", cover: "/assets/products/lattice-board-editorial.webp",
    coverAlt: "Three task lanes with ivory paper cards and status markers on a sage board", label: "Obsidian plugin", slot: 1, icon: "board",
  },
  {
    id: "weekly", cover: "/assets/products/weekly-schedule-editorial.webp",
    coverAlt: "An open weekly planner with task slips and a four-quadrant priority insert", label: "Obsidian plugin", slot: 0, icon: "calendar",
  },
  {
    id: "vibespace", cover: "/assets/products/vibespace-editorial.webp",
    coverAlt: "Smoked-glass panels, execution tools, and a reviewed document", label: "Local-first AI agent", slot: 2, icon: "workspace",
  },
] as const satisfies readonly Product[];
