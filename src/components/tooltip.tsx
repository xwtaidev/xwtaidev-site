import type { ReactNode } from "react";

export function Tooltip({
  id,
  content,
  className = "",
  align = "center",
  children,
}: {
  id: string;
  content: string;
  className?: string;
  align?: "center" | "end";
  children: ReactNode;
}) {
  return (
    <span className={`t-tt-wrap t-tt-align-${align} ${className}`}>
      {children}
      <span className="t-tt" id={id} role="tooltip">{content}</span>
    </span>
  );
}
