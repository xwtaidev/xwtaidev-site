import Image from "next/image";
import { DetailButton, DetailLink } from "@/components/detail-trigger";
import { Icon } from "@/components/icon";
import { SiteFooter } from "@/components/site-footer";
import { Tooltip } from "@/components/tooltip";
import { profile } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#about">Skip to introduction</a>
      <main className="page" id="about">
        <header className="identity">
          <h1 className="sr-only">{profile.name} — {profile.role}</h1>
          <Tooltip id="identity-hint" content="A little about me" className="identity-wrap">
            <DetailButton detail="about" className="identity-button t-tt-trigger" aria-label={`A little about ${profile.name}`} aria-describedby="identity-hint">
              <Image className="identity-avatar" src="/assets/avatar.jpg" alt={`Portrait of ${profile.name}`} width={40} height={40} sizes="40px" priority />
            </DetailButton>
          </Tooltip>
        </header>

        <section className="introduction" aria-label="Introduction">
          <p className="intro-lead">I&apos;m <span className="name-reveal">{profile.name}</span>, a developer and independent maker. I build AI tools and productivity apps around the everyday problems I want to solve.</p>

          <p>In Obsidian, I&apos;m making <Tooltip id="lattice-hint" content="Kanban for your notes · Obsidian plugin"><DetailLink detail="lattice" className="chip t-tt-trigger" aria-describedby="lattice-hint"><Icon name="board" className="chip-icon" /><span>Lattice Board</span></DetailLink></Tooltip> for visual note organization, and <Tooltip id="weekly-hint" content="Weekly planning, inside your vault"><DetailLink detail="weekly" className="chip t-tt-trigger" aria-describedby="weekly-hint"><Icon name="calendar" className="chip-icon" /><span>Weekly Schedule</span></DetailLink></Tooltip> for planning and reviewing the week.</p>

          <p>I&apos;m also exploring <Tooltip id="vibespace-hint" content="AI workspace for macOS · In development"><DetailLink detail="vibespace" className="chip t-tt-trigger" aria-describedby="vibespace-hint"><Icon name="workspace" className="chip-icon" /><span>VibeSpace</span></DetailLink></Tooltip>, a local-first AI workspace for macOS, bringing agents and task boards together. It&apos;s still a work in progress.</p>

          <p>I care about clear interactions and keeping people in control of their data. More of my work is on <a className="text-link underline-reveal" data-link="github" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>, and you can <a className="text-link underline-reveal" href={`mailto:${profile.email}`}>say hello</a> by email.</p>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
