import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const root = useRef(null);
  const { data } = usePortfolio();
  const skillGroups = data.skillGroups;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".skill-fill").forEach((bar) => {
        gsap.fromTo(
          bar,
          { width: 0 },
          {
            width: `${bar.dataset.value}%`,
            duration: 1.35,
            ease: "power3.out",
            scrollTrigger: { trigger: bar, start: "top 90%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="shell page-pad">
      <PageTitle
        eyebrow="My Abilities"
        title="Skills Showcase"
        description="Technologies and tools I am learning and using to build modern, animated, and scalable software projects."
      />
      <div className="skills-grid">
        {skillGroups.map(({ title, skills, icon: Icon }) => (
          <GlassCard key={title} className="skill-card">
            <h3><Icon /> {title}</h3>
            {skills.map(([name, value]) => (
              <div className="skill-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{value}%</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" data-value={value} />
                </div>
              </div>
            ))}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
