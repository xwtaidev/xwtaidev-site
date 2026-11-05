import type { ReactNode } from "react";
import { createSocialMetadata, socialPages } from "@/lib/social";

export const metadata = createSocialMetadata(socialPages.rabbitHoles);

export default function RabbitHolesLayout({ children }: { children: ReactNode }) {
  return children;
}
