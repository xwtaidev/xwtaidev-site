import { DetailLink } from "@/components/detail-trigger";
import { Icon } from "@/components/icon";
import { OrbitNavigation } from "@/components/orbit-navigation";
import { SiteFooter } from "@/components/site-footer";
import { TechTerm } from "@/components/tech-term";
import { Tooltip } from "@/components/tooltip";
import { profile } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#about">Skip to introduction</a>
      <main className="page" id="about">
        <header className="identity identity-orbit">
          <h1 className="sr-only">{profile.name} — {profile.role}</h1>
          <OrbitNavigation />
        </header>

        <section className="introduction" aria-label="Introduction">
          <p className="intro-lead">I&apos;m <span className="name-reveal">{profile.name}</span>, a developer and independent maker. I build AI tools and productivity apps around the everyday problems I want to solve.</p>

          <p className="expertise-copy">
            My work spans <TechTerm icon="tech-agent" monochrome>AI agents</TechTerm>, <TechTerm icon="tech-python">Python</TechTerm> and <TechTerm icon="tech-java">Java</TechTerm> backends, web apps with <TechTerm icon="tech-typescript">TypeScript</TechTerm>, <TechTerm icon="tech-react">React</TechTerm> and <TechTerm icon="tech-nextjs" monochrome>Next.js</TechTerm>, <TechTerm icon="obsidian">Obsidian</TechTerm> plugins, and desktop apps with <TechTerm icon="tech-rust" monochrome>Rust</TechTerm> and <TechTerm icon="tech-tauri">Tauri</TechTerm>.
          </p>

          <p>In Obsidian, I&apos;m making <Tooltip id="lattice-hint" content="Kanban for your notes · Obsidian plugin"><DetailLink detail="lattice" className="chip t-tt-trigger" aria-describedby="lattice-hint"><Icon name="board" className="chip-icon" /><span>Lattice Board</span></DetailLink></Tooltip> for visual note organization, and <Tooltip id="weekly-hint" content="Weekly planning, inside your vault"><DetailLink detail="weekly" className="chip t-tt-trigger" aria-describedby="weekly-hint"><Icon name="calendar" className="chip-icon" /><span>Weekly Schedule</span></DetailLink></Tooltip> for planning and reviewing the week.</p>

          <p>I&apos;m also exploring <Tooltip id="vibespace-hint" content="AI workspace for macOS · In development"><DetailLink detail="vibespace" className="chip t-tt-trigger" aria-describedby="vibespace-hint"><Icon name="workspace" className="chip-icon" /><span>VibeSpace</span></DetailLink></Tooltip>, a local-first AI workspace for macOS, bringing agents and task boards together. It&apos;s still a work in progress.</p>

          <p>I care about clear interactions and keeping people in control of their data. More of my work is on <a className="text-link underline-reveal" data-link="github" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>, and you can <a className="text-link underline-reveal" href={`mailto:${profile.email}`}>say hello</a> by email.</p>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
