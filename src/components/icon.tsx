import type { CSSProperties } from "react";

const paths = {
  bookmark: "bookmark-simple",
  note: "note-pencil",
  flask: "flask",
  github: "github-logo",
  x: "x-logo",
  sun: "sun",
  moon: "moon",
  close: "x",
  external: "arrow-up-right",
  board: "kanban",
  calendar: "calendar-blank",
  workspace: "stack-simple",
  orbitAbout: "orbit-user",
  orbitBlog: "orbit-notebook",
  orbitProducts: "orbit-flask",
} as const;

export function Icon({ name, className = "" }: { name: keyof typeof paths; className?: string }) {
  return (
    <span
      className={`icon-mask ${className}`}
      style={{ "--icon": `url('/assets/icons/${paths[name]}.svg')` } as CSSProperties}
      aria-hidden="true"
    />
  );
}
