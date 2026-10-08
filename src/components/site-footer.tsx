import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/site";
import { Icon } from "./icon";
import { ThemeButton } from "./theme-button";
import { Tooltip } from "./tooltip";

export function SiteFooter({ showTheme = true, showHome = false }: { showTheme?: boolean; showHome?: boolean }) {
  const signature = <Image className="signature" src="/assets/signature-xwt.png" alt={profile.signature} width={64} height={25} sizes="64px" />;
  return (
    <footer className="footer">
      {showHome ? <Link className="footer-home" href="/" aria-label="Back to home">{signature}<span>Home</span></Link> : signature}
      <nav className="footer-links" aria-label={showTheme ? "Elsewhere and appearance" : "Elsewhere"}>
        <Tooltip id="github-hint" content="GitHub">
          <a className="icon-button t-tt-trigger" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub, opens in a new tab" aria-describedby="github-hint">
            <Icon name="github" className="footer-icon social-icon" />
          </a>
        </Tooltip>
        <Tooltip id="x-hint" content="X · @xwtaidev">
          <a className="icon-button t-tt-trigger" href={profile.x} target="_blank" rel="noopener noreferrer" aria-label="Visit X, opens in a new tab" aria-describedby="x-hint">
            <Icon name="x" className="footer-icon social-icon" />
          </a>
        </Tooltip>
        <Tooltip id="hello-hint" content="Say hello">
          <a href={`mailto:${profile.email}`} className="icon-button email-button t-tt-trigger" aria-label="Say hello" aria-describedby="hello-hint">
            <Image className="gmail-icon" src="/assets/icons/gmail.svg" alt="" width={16} height={16} sizes="16px" />
          </a>
        </Tooltip>
        {showTheme && <><span className="footer-divider" aria-hidden="true" /><ThemeButton /></>}
      </nav>
    </footer>
  );
}
