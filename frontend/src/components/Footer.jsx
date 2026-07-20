import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

export default function Footer() {
  const { data } = usePortfolio();
  const { socialLinks } = data;
  return (
    <footer className="footer shell">
      <strong>Mohammed Nagoor Meerasha</strong>
      <p>Built with React, Three.js, Framer Motion, GSAP and Tailwind CSS</p>
      <div>
        {socialLinks.map(({ label, icon: Icon, url }) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} onClick={() => trackEvent("social_click", { page: "footer", metadata: { label, url } })}>
            <Icon />
          </a>
        ))}
      </div>
      <small>Copyright 2026. All rights reserved.</small>
    </footer>
  );
}
