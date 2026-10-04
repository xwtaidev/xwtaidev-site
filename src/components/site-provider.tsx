"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { details, type DetailKey } from "@/content/site";
import { getServerTheme, getTheme, subscribeTheme, toggleTheme, type Theme } from "@/lib/theme";
import { Icon } from "./icon";

type SiteContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  openDetails: (key: DetailKey) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("Site controls must be inside SiteProvider.");
  return context;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const [selected, setSelected] = useState<DetailKey | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const view = selected ? details[selected] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selected || !dialog) return;
    dialog.classList.remove("is-closing", "is-open");
    if (!dialog.open) dialog.showModal();
    const frame = requestAnimationFrame(() => dialog.classList.add("is-open"));
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  function openDetails(key: DetailKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setSelected(key);
  }

  function closeDetails() {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")) || 150;
    closeTimer.current = setTimeout(() => {
      dialog.close();
      dialog.classList.remove("is-closing");
      closeTimer.current = null;
      setSelected(null);
    }, duration);
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDetails();
  }

  return (
    <SiteContext.Provider value={{ theme, toggleTheme, openDetails }}>
      {children}
      <dialog
        ref={dialogRef}
        className="detail-dialog t-modal"
        aria-labelledby="detail-title"
        aria-describedby="detail-description"
        onCancel={(event) => { event.preventDefault(); closeDetails(); }}
        onClick={closeOnBackdrop}
      >
        <button className="dialog-close icon-button" type="button" aria-label="Close details" onClick={closeDetails}>
          <Icon name="close" className="dialog-close-icon" />
        </button>
        <div className="dialog-content">
          <div className="dialog-eyebrow">{view?.eyebrow}</div>
          <h2 id="detail-title">{view?.title}</h2>
          <div className="dialog-copy" id="detail-description">
            {view?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {view?.email && <p><a href={`mailto:${view.email}`}>{view.email}</a></p>}
            {view?.links && (
              <div className="project-links">
                {view.links.map((link) => (
                  <p className="project-reference" key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.icon === "obsidian" ? (
                        <Image className="project-link-icon" src="/assets/icons/obsidian.svg" alt="" width={16} height={16} />
                      ) : (
                        <Icon name="github" className="project-link-icon" />
                      )}
                      <span>{link.label}</span>
                      <Icon name="external" className="external-icon" />
                    </a>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </SiteContext.Provider>
  );
}
