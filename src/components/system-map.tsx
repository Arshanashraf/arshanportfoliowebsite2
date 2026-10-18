/**
 * The hero's application map.
 *
 * Geometry, node sizing, stroke weights and the travelling flow dots are lifted
 * verbatim from the approved mockup (mockups/index.html, `#heroVisual`) so the live
 * map is the same drawing: five real connector paths anchored to node edges, a
 * marching dashed stroke along each one, two dots per link on a staggered loop, and
 * an arrowhead riding the line rotated to its direction of travel. Every path is
 * declared once in LINKS and reused by both the visible stroke and its
 * `animateMotion`, so they cannot drift apart.
 *
 * All of it is decorative — the svg carries role="img" with a title/desc, and the
 * motion stands down under prefers-reduced-motion.
 */

import type { CSSProperties } from "react";

type Link = {
  id: string;
  /** Path data, also fed to animateMotion. */
  d: string;
  /** Seconds for one traversal; scaled to path length so speed reads evenly. */
  dur: number;
  /** begin offsets (−s) for the two travelling dots. */
  dots: [number, number];
  /** begin offset (−s) for the arrowhead. */
  arrow: number;
  /** The one link drawn in the accent colour. */
  live?: boolean;
};

type Node = {
  x: number;
  y: number;
  label: string;
  sub: string;
};

const NODE_WIDTH = 142;
const NODE_HEIGHT = 74;

const NODES: Node[] = [
  { x: 52, y: 55, label: "INTERFACE", sub: "React · Next.js" },
  { x: 162, y: 159, label: "APPLICATION", sub: "APIs · services" },
  { x: 366, y: 159, label: "INTELLIGENCE", sub: "Retrieval · models" },
  { x: 162, y: 267, label: "DATA", sub: "Storage · events" },
  { x: 366, y: 267, label: "OPERATIONS", sub: "Containers · tools" },
];

const LINKS: Link[] = [
  { id: "interface-application", d: "M123 129V196H162", dur: 4, dots: [-0.4, -2.4], arrow: -1.4 },
  { id: "application-intelligence", d: "M304 196H366", dur: 2.4, dots: [-0.3, -1.5], arrow: -0.9, live: true },
  { id: "application-data", d: "M233 233V267", dur: 1.4, dots: [-0.2, -0.9], arrow: -0.6 },
  { id: "intelligence-operations", d: "M437 233V267", dur: 1.4, dots: [-0.5, -1.1], arrow: -0.3 },
  { id: "data-operations", d: "M304 304H366", dur: 2.4, dots: [-0.7, -1.9], arrow: -1.2 },
];

export default function SystemMap() {
  return (
    <svg className="system-map" viewBox="0 0 560 420" fill="none" role="img" aria-labelledby="map-title map-desc">
      <title id="map-title">Interactive map of an application stack</title>
      <desc id="map-desc">Interface connects to application services, intelligence, data, and operations with feedback between layers. Focus or hover a node to highlight it.</desc>
      <g className="map-links">
        {LINKS.map((link) => (
          <path key={link.id} className={link.live ? "map-path map-path--live" : "map-path"} d={link.d} />
        ))}
      </g>
      <g className="map-flows" aria-hidden="true">
        {LINKS.map((link) => (
          <g key={link.id}>
            {link.dots.map((begin) => (
              <circle className="map-flow" key={begin} r="3.2">
                <animateMotion dur={`${link.dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={link.d} />
              </circle>
            ))}
            <path className="map-flow-arrow" d="M-4.5 -3 4.5 0 -4.5 3Z">
              <animateMotion dur={`${link.dur}s`} begin={`${link.arrow}s`} rotate="auto" repeatCount="indefinite" path={link.d} />
            </path>
          </g>
        ))}
      </g>
      {NODES.map((node, index) => (
        <g key={node.label} className="map-node" style={{ "--node-order": index } as CSSProperties} tabIndex={0}>
          <rect x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT} rx="8" />
          <circle cx={node.x + 24} cy={node.y + 25} r="7" />
          <text x={node.x + 42} y={node.y + 29}>{node.label}</text>
          <text className="map-sub" x={node.x + 24} y={node.y + 51}>{node.sub}</text>
        </g>
      ))}
      <text className="map-annotation" x="52" y="392">A SYSTEM IS A SET OF CONNECTIONS.</text>
      <text className="map-annotation" x="452" y="392">FIG. 01 / STACK</text>
    </svg>
  );
}
