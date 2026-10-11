"use client";

import { DetailLink } from "@/components/detail-trigger";
import { Icon } from "@/components/icon";
import { OrbitNavigation } from "@/components/orbit-navigation";
import { SiteFooter } from "@/components/site-footer";
import { TechTerm } from "@/components/tech-term";
import { Tooltip } from "@/components/tooltip";
import { profile } from "@/content/site";
import { useLocale } from "@/components/locale-provider";

export default function HomePage() {
  const { messages } = useLocale();
  const copy = messages.home;
  return (
    <>
      <a className="skip-link" href="#about">{copy.skip}</a>
      <main className="page" id="about">
        <header className="identity identity-orbit">
          <h1 className="sr-only">{profile.name} — {messages.role}</h1>
          <OrbitNavigation />
        </header>

        <section className="introduction" aria-label={copy.introduction}>
          <p className="intro-lead">{copy.leadBefore}<span className="name-sweep">{profile.signature.toUpperCase()}</span>{copy.leadAfter}</p>

          <p className="expertise-copy">
            {copy.workSpans}<TechTerm icon="tech-agent" monochrome>{copy.agents}</TechTerm>{copy.afterAgents}<TechTerm icon="tech-python">Python</TechTerm>{copy.and}<TechTerm icon="tech-java">Java</TechTerm>{copy.backendsToWeb}<TechTerm icon="tech-typescript">TypeScript</TechTerm>{copy.afterAgents}<TechTerm icon="tech-react">React</TechTerm>{copy.and}<TechTerm icon="tech-nextjs" monochrome>Next.js</TechTerm>{copy.beforeObsidian}<TechTerm icon="obsidian">Obsidian</TechTerm>{copy.beforeDesktop}<TechTerm icon="tech-rust" monochrome>Rust</TechTerm>{copy.and}<TechTerm icon="tech-tauri">Tauri</TechTerm>{copy.expertiseEnd}
          </p>

          <p>{copy.obsidianBefore}<Tooltip id="lattice-hint" content={copy.latticeHint}><DetailLink detail="lattice" className="chip t-tt-trigger" aria-describedby="lattice-hint"><Icon name="board" className="chip-icon" /><span>Lattice Board</span></DetailLink></Tooltip>{copy.latticeAfter}<Tooltip id="weekly-hint" content={copy.weeklyHint}><DetailLink detail="weekly" className="chip t-tt-trigger" aria-describedby="weekly-hint"><Icon name="calendar" className="chip-icon" /><span>Weekly Schedule</span></DetailLink></Tooltip>{copy.weeklyAfter}</p>

          <p>{copy.vibespaceBefore}<Tooltip id="vibespace-hint" content={copy.vibespaceHint}><DetailLink detail="vibespace" className="chip t-tt-trigger" aria-describedby="vibespace-hint"><Icon name="workspace" className="chip-icon" /><span>VibeSpace</span></DetailLink></Tooltip>{copy.vibespaceAfter}</p>

          <p>{copy.contactBefore}<a className="text-link underline-reveal" data-link="github" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>{copy.afterGithub}<a className="text-link underline-reveal" href={`mailto:${profile.email}`}>{copy.hello}</a>{copy.contactEnd}</p>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
