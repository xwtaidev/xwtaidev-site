import Image from "next/image";
import type { ReactNode } from "react";

export function TechTerm({ icon, children, monochrome = false }: { icon: string; children: ReactNode; monochrome?: boolean }) {
  return (
    <span className="tech-term">
      <Image
        className={`tech-term-icon${monochrome ? " tech-term-icon-monochrome" : ""}`}
        src={`/assets/icons/${icon}.svg`}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        sizes="14px"
      />
      <span>{children}</span>
    </span>
  );
}
