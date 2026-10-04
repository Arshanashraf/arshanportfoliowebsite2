"use client";
import { useState, type CSSProperties } from "react";
export type SkillItem = { id: string; name: string; group_name: string; confidence: "core" | "working_knowledge" | "currently_learning" | "exploring"; description: string };
const confidence: Record<SkillItem["confidence"], string> = { core: "Core", working_knowledge: "Working knowledge", currently_learning: "Currently learning", exploring: "Exploring" };
export default function SkillAtlas({ skills }: { skills: SkillItem[] }) {
  const [activeGroup, setActiveGroup] = useState("All");
  if (!skills.length) return <div className="empty-state"><h3>Technology map in progress.</h3><p>Owner-curated skills will appear here when added in the admin workspace.</p></div>;
  const groups = [...new Set(skills.map((skill) => skill.group_name))];
  const lanes = [skills.filter((_, index) => index % 2 === 0), skills.filter((_, index) => index % 2 === 1)];
  const filtered = activeGroup === "All" ? skills : skills.filter((skill) => skill.group_name === activeGroup);
  return <div className="skill-atlas"><div className="skill-marquees" aria-label="Owner-selected technologies">{lanes.map((lane, index) => lane.length > 0 && <div className={`skill-marquee skill-marquee--${index + 1}`} key={index}><div className="skill-marquee-track">{[...lane, ...lane].map((skill, clone) => <span className="skill-marquee-item" key={`${index}-${skill.id}-${clone}`} aria-hidden={clone >= lane.length}>{skill.name}<i>{skill.group_name}</i></span>)}</div></div>)}</div><div className="ecosystem-heading"><span className="section-kicker">01 / STACK</span><p>Explore the technologies and confidence levels selected in the admin.</p></div><div className="ecosystem-tabs" role="group" aria-label="Filter skills by category"><button type="button" aria-pressed={activeGroup === "All"} onClick={() => setActiveGroup("All")}>All</button>{groups.map((group) => <button type="button" key={group} aria-pressed={activeGroup === group} onClick={() => setActiveGroup(group)}>{group}</button>)}</div><div className="ecosystem-grid">{filtered.map((skill, index) => <article className="ecosystem-skill" key={skill.id} style={{ "--skill-index": index } as CSSProperties}><div className="ecosystem-node" aria-hidden="true"><i/></div><span className="section-kicker">{skill.group_name}</span><h3>{skill.name}</h3><span className="skill-level">{confidence[skill.confidence]}</span>{skill.description && <p>{skill.description}</p>}</article>)}</div></div>;
}

