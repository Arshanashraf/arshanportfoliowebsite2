export type SkillItem = { id: string; name: string; group_name: string; confidence: "core" | "working_knowledge" | "currently_learning" | "exploring"; description: string };

/**
 * The two-lane technology slider. Presentational only, so the landing page can show
 * the marquee without shipping the interactive skill grid (that lives on /about).
 */
export default function SkillMarquee({ skills, className = "skill-marquees" }: { skills: SkillItem[]; className?: string }) {
  if (!skills.length) return null;
  const lanes = [skills.filter((_, index) => index % 2 === 0), skills.filter((_, index) => index % 2 === 1)];
  return <div className={className} aria-label="Owner-selected technologies">{lanes.map((lane, index) => lane.length > 0 && <div className={`skill-marquee skill-marquee--${index + 1}`} key={index}><div className="skill-marquee-track">{[...lane, ...lane].map((skill, clone) => <span className="skill-marquee-item" key={`${index}-${skill.id}-${clone}`} aria-hidden={clone >= lane.length}>{skill.name}<i>{skill.group_name}</i></span>)}</div></div>)}</div>;
}
