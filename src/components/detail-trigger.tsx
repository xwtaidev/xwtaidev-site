"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { DetailKey } from "@/content/site";
import { useSite } from "./site-provider";

type LinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & { detail: DetailKey };
type ButtonProps = ComponentPropsWithoutRef<"button"> & { detail: DetailKey };

export function DetailLink({ detail, onClick, ...props }: LinkProps) {
  const { openDetails } = useSite();
  return (
    <a
      {...props}
      href={`#${detail}`}
      data-view={detail}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        openDetails(detail);
      }}
    />
  );
}

export function DetailButton({ detail, onClick, ...props }: ButtonProps) {
  const { openDetails } = useSite();
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openDetails(detail);
      }}
    />
  );
}
