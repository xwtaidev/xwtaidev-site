"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/site";
import { prepareContributions } from "@/lib/github-contributions";
import { useLocale } from "./locale-provider";

type Calendar = ReturnType<typeof prepareContributions>;

export function GitHubContributions() {
  const { locale, messages } = useLocale();
  const copy = messages.contributions;
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("https://github-contributions-api.jogruber.de/v4/xwtaidev?y=last", { signal: controller.signal });
        if (!response.ok) throw new Error("Contribution request failed");
        const data = prepareContributions(await response.json());
        if (!controller.signal.aborted) setCalendar(data);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const formatDate = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const formatMonth = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const monthLabels = calendar?.months.filter((_, index) => index % 3 === 0);

  return (
    <section className="github-activity" aria-label={copy.summary}>
      <div className="github-activity-heading">
        <h2>{copy.title}</h2>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">{copy.link} <span aria-hidden="true">↗</span></a>
      </div>
      {calendar ? (
        <>
          <div className="github-activity-months" style={{ gridTemplateColumns: `repeat(${calendar.weeks}, minmax(0, 1fr))` }} aria-hidden="true">
            {monthLabels?.map(({ month, week }, index) => <span key={`${month}-${index}`} style={{ gridColumn: `${week + 1} / span 4` }}>{formatMonth.format(new Date(Date.UTC(2024, month, 1)))}</span>)}
          </div>
          <div className="github-activity-grid" style={{ gridTemplateColumns: `repeat(${calendar.weeks}, minmax(0, 1fr))` }} role="img" aria-label={copy.summary}>
            {calendar.days.map((day) => (
              <span key={day.date} className="github-activity-day" data-level={day.level} style={{ gridColumn: day.week + 1, gridRow: day.weekday + 1 }} title={copy.count.replace("{count}", String(day.count)).replace("{date}", formatDate.format(new Date(`${day.date}T00:00:00Z`)))} />
            ))}
          </div>
          <p className="github-activity-caption">{copy.pastYear}</p>
        </>
      ) : <p className="github-activity-caption" role="status">{failed ? copy.unavailable : copy.loading}</p>}
    </section>
  );
}
