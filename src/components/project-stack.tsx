import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";

/** The abstract systems diagram that stands in for a project screenshot. */
function ProjectMap({ index }: { index: number }) {
  return (
    <div className="project-map" aria-hidden="true">
      <span className="project-map-coordinate">SYS / {String(index + 1).padStart(2, "0")}</span>
      <svg viewBox="0 0 600 330">
        <path d="M100 90h170v75m0-75h220m-220 75v90m0-90h220v90M100 255h170m0 0h220" />
        <path className="project-map-flow" d="M100 90h170v75h220v90" />
        <g><rect x="38" y="61" width="125" height="58" /><text x="58" y="88">INTERFACE</text><circle cx="51" cy="78" r="4" /></g>
        <g><rect x="208" y="136" width="125" height="58" /><text x="228" y="163">APPLICATION</text><circle cx="221" cy="153" r="4" /></g>
        <g><rect x="428" y="61" width="125" height="58" /><text x="448" y="88">SERVICES</text><circle cx="441" cy="78" r="4" /></g>
        <g><rect x="428" y="226" width="125" height="58" /><text x="448" y="253">DATA</text><circle cx="441" cy="243" r="4" /></g>
      </svg>
      <span className="project-map-caption">SYSTEM STUDY · NO PROJECT SCREENSHOTS SUPPLIED</span>
    </div>
  );
}

/**
 * Selected work as sticky stacking cards: every project is present in the document
 * at once (no carousel state, nothing hidden from search or screen readers), and each
 * card pins slightly lower than the one before it so they pile up as you scroll.
 */
export default function ProjectStack({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return <div className="empty-state"><h3>Project index in progress.</h3><p>Published projects will appear here when verified and released.</p></div>;
  }

  return (
    <div className="stack">
      {projects.map((project, index) => (
        <article className="stack-card" key={project.slug} style={{ "--i": index } as CSSProperties}>
          <div className="stack-art">
            <ProjectMap index={index} />
            <span className="stack-flag">
              {project.placeholder ? "SAMPLE CONTENT" : project.currentlyBuilding ? "CURRENTLY BUILDING" : "PROJECT SYSTEM"}
            </span>
          </div>
          <div className="stack-body">
            <span className="section-kicker">{String(index + 1).padStart(2, "0")} / {project.category.toUpperCase()}</span>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            {project.technologies.length > 0 && <div className="stack-tech">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>}
            {project.placeholder && <p className="editorial-note">Sample content — replace with verified project details.</p>}
            <div className="stack-actions">
              <Link className="button button--primary" href={`/projects/${project.slug}`}>View case study <span>↗</span></Link>
              {project.repoUrl && <a className="text-link" href={project.repoUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
              {project.demoUrl && <a className="text-link" href={project.demoUrl} target="_blank" rel="noreferrer">Live demo ↗</a>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
