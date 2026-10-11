"use client";

import { Icon } from "./icon";
import { useLocale } from "./locale-provider";
import type { BlogCoverKind } from "@/content/blog";
import "./blog-cover-art.css";

export type { BlogCoverKind } from "@/content/blog";

export function BlogCoverArt({ type }: { type: BlogCoverKind }) {
  const { messages } = useLocale();
  const copy = messages.blog.art;
  if (type === "keyboard") return (
    <div className="log-art log-art-keyboard" aria-hidden="true"><div className="log-keyboard"><div className="log-keyboard-row">{["esc", "1", "2", "3", "4", "5", "6", "7", "⌫"].map((key) => <span key={key}>{key}</span>)}</div><div className="log-keyboard-row">{["tab", "Q", "W", "E", "R", "T", "Y", "U", "I"].map((key) => <span key={key}>{key}</span>)}</div><div className="log-keyboard-row">{["⇧", "A", "S", "D", "F", "G", "H", "↵"].map((key) => <span key={key}>{key}</span>)}</div><div className="log-keyboard-row"><span>⌘</span><span>⌥</span><span className="log-keyboard-space" /><span>←</span><span>→</span></div></div><span className="log-art-caption">{copy.keyboardCaption}</span></div>
  );
  if (type === "sketch") return (
    <div className="log-art log-art-sketch" aria-hidden="true"><div className="log-sketch-sheet"><span>{copy.sketchTitle}</span><svg viewBox="0 0 240 140" fill="none"><path d="M15 111C41 107 35 40 66 51S88 136 115 87S133 29 159 58S186 94 222 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M15 125H226M16 12V125" stroke="currentColor" strokeOpacity=".2" strokeWidth="1" /><circle cx="222" cy="22" r="4" fill="currentColor" /><path d="M186 16L208 20L195 29" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg><small>{copy.sketchNote}</small></div></div>
  );
  if (type === "markdown") return (
    <div className="log-art log-art-markdown" aria-hidden="true">
      <div className="log-file"><span className="log-file-tab">{copy.markdownFile} <span>↗</span></span><div className="log-file-code"><span className="log-code-muted">---</span><br /><span>title:</span> {copy.smallIdea}<br /><span>status:</span> in-progress<br /><span className="log-code-muted">---</span><br /><br /><strong>## {copy.nextStep}</strong><br /><span className="log-code-check">- [x]</span> {copy.makeUseful}<br /><span className="log-code-muted">- [ ] {copy.tryTomorrow}</span></div></div>
      <span className="log-art-caption">{copy.markdownCaption}</span>
    </div>
  );
  if (type === "agent") return (
    <div className="log-art log-art-agent" aria-hidden="true"><div className="log-agent-path"><span>01 <b>{copy.agentUnderstand}</b></span><i /><span>02 <b>{copy.agentChange}</b></span><i /><span className="log-agent-done">03 <b>{copy.agentNext}</b><Icon name="check" /></span></div><span className="log-art-caption">{copy.agentCaption}</span></div>
  );
  if (type === "week") return (
    <div className="log-art log-art-week" aria-hidden="true"><div className="log-week-sheet"><div><span>{copy.weekTitle}</span><Icon name="calendar" /></div><div className="log-week-grid">{copy.weekDays.map((day, index) => <span key={index}>{day}<i data-filled={index === 2 || index === 4} /><i data-filled={index < 3} /><i /></span>)}</div><span className="log-week-line">{copy.weekNote}</span></div></div>
  );
  if (type === "workspace") return (
    <div className="log-art log-art-workspace" aria-hidden="true"><div className="log-orbit log-orbit-one" /><div className="log-orbit log-orbit-two" /><div className="log-workspace-window"><span className="log-window-bar"><i /><i /><i /><span>VibeSpace</span></span><div className="log-workspace-content"><span className="log-workspace-spark"><Icon name="workspace" /></span><span>{copy.workspaceFirst}<br />{copy.workspaceSecond}</span><small><i /> {copy.workspaceStatus}</small></div></div><span className="log-art-caption">{copy.workspaceCaption}</span></div>
  );
  return (
    <div className="log-art log-art-board" aria-hidden="true"><div className="log-board-paper log-board-paper-back" /><div className="log-board-paper"><span className="log-board-title"><Icon name="board" /> {copy.smallIdea} <span>•••</span></span><div className="log-board-columns">{copy.boardColumns.map((column, index) => <div key={index}><span><i />{column.name}</span><div className={`log-board-note log-board-note-${index}`}><b>{column.title}</b><i /><i /><small>{column.note}</small></div>{index < 2 && <div className="log-board-note log-board-note-extra"><i /><i /></div>}</div>)}</div></div><span className="log-art-caption">{copy.boardCaption}</span></div>
  );
}
