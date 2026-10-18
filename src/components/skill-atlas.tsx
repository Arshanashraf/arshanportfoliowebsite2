"use client";
import { useState, type CSSProperties } from "react";
import SkillMarquee, { type SkillItem } from "@/components/skill-marquee";
export type { SkillItem };
const confidence: Record<SkillItem["confidence"], string> = { core: "Core", working_knowledge: "Working knowledge", currently_learning: "Currently learning", exploring: "Exploring" };
export default function SkillAtlas({ skills }: { skills: SkillItem[] }) {
  const [activeGroup, setActiveGroup] = useState("All");
  if (!skills.length) return <div className="empty-state"><h3>Technology map in progress.</h3><p>Owner-curated skills will appear here when added in the admin workspace.</p></div>;
  const groups = [...new Set(skills.map((skill) => skill.group_name))];
  const filtered = activeGroup === "All" ? skills : skills.filter((skill) => skill.group_name === activeGroup);
  return <div className="skill-atlas"><SkillMarquee skills={skills}/><div className="ecosystem-tabs" role="group" aria-label="Filter skills by category"><button type="button" aria-pressed={activeGroup === "All"} onClick={() => setActiveGroup("All")}>All</button>{groups.map((group) => <button type="button" key={group} aria-pressed={activeGroup === group} onClick={() => setActiveGroup(group)}>{group}</button>)}</div><div className="ecosystem-grid">{filtered.map((skill, index) => <article className="ecosystem-skill" key={skill.id} style={{ "--skill-index": index } as CSSProperties}><div className="ecosystem-node" aria-hidden="true"><i/></div><span className="section-kicker">{skill.group_name}</span><h3>{skill.name}</h3><span className="skill-level">{confidence[skill.confidence]}</span>{skill.description && <p>{skill.description}</p>}</article>)}</div></div>;
}
