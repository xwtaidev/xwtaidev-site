"use client";

import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/site";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";
import { SitePreferences } from "./site-preferences";
import { Tooltip } from "./tooltip";

export function SiteFooter({ showTheme = true, showHome = false }: { showTheme?: boolean; showHome?: boolean }) {
  const { messages } = useLocale();
  const signature = <Image className="signature" src="/assets/signature-xwt.png" alt={profile.signature} width={64} height={25} sizes="64px" />;
  return (
    <footer className="footer">
      {showHome ? <Link className="footer-home" href="/" aria-label={messages.navigation.backHome}>{signature}<span>{messages.navigation.home}</span></Link> : signature}
      <nav className="footer-links" aria-label={showTheme ? messages.footer.controls : messages.footer.elsewhere}>
        <Tooltip id="github-hint" content="GitHub">
          <a className="icon-button t-tt-trigger" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label={messages.footer.github} aria-describedby="github-hint">
            <Icon name="github" className="footer-icon social-icon" />
          </a>
        </Tooltip>
        <Tooltip id="x-hint" content="X · @xwtaidev">
          <a className="icon-button t-tt-trigger" href={profile.x} target="_blank" rel="noopener noreferrer" aria-label={messages.footer.x} aria-describedby="x-hint">
            <Icon name="x" className="footer-icon social-icon" />
          </a>
        </Tooltip>
        <Tooltip id="hello-hint" content={messages.footer.hello}>
          <a href={`mailto:${profile.email}`} className="icon-button email-button t-tt-trigger" aria-label={messages.footer.hello} aria-describedby="hello-hint">
            <Image className="gmail-icon" src="/assets/icons/gmail.svg" alt="" width={16} height={16} sizes="16px" />
          </a>
        </Tooltip>
        {showTheme && <SitePreferences />}
      </nav>
    </footer>
  );
}
