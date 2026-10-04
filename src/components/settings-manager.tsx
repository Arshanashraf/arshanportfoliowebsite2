"use client";
import { useEffect, useState } from "react";
type Setting = { key: string; value: string | number };
const fields = [
  { key: "bio", label: "Short bio", kind: "textarea", note: "A concise first-person profile." },
  { key: "role", label: "Public role", kind: "text", note: "Example: Full-Stack Developer." },
  { key: "github_url", label: "GitHub profile", kind: "url", note: "HTTPS profile link." },
  { key: "linkedin_url", label: "LinkedIn profile", kind: "url", note: "HTTPS profile link." },
  { key: "seo_title", label: "Default SEO title", kind: "text", note: "Used when a page has no specific title." },
  { key: "seo_description", label: "Default SEO description", kind: "textarea", note: "A brief, accurate site description." },
  { key: "privacy_retention_days", label: "Contact message retention (days)", kind: "number", note: "Required before the inbox accepts messages. Choose 1 to 365 days." },
  { key: "theme_default", label: "Default display theme", kind: "select", note: "Visitors can still choose their own theme." },
] as const;
export default function SettingsManager() {
  const [items, setItems] = useState<Setting[]>([]);
  const [selected, setSelected] = useState<string>("bio");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" }).then(async (response) => {
      const body = await response.json() as { items?: Setting[]; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not load settings.");
      if (active) setItems(body.items ?? []);
    }).catch((problem) => {
      if (active) setError(problem instanceof Error ? problem.message : "Could not load settings.");
    });
    return () => { active = false; };
  }, []);
  const definition = fields.find((field) => field.key === selected)!;
  function choose(key: string) {
    setSelected(key);
    const found = items.find((item) => item.key === key);
    setValue(found === undefined ? key === "theme_default" ? "light" : "" : String(found.value));
  }
  async function refresh() {
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const body = await response.json() as { items?: Setting[]; error?: string };
    if (!response.ok) throw new Error(body.error || "Could not load settings.");
    setItems(body.items ?? []);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const parsed = definition.kind === "number" ? Number(value) : value;
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: selected, value: parsed }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save this setting.");
      setNotice("Setting saved."); await refresh();
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not save this setting."); }
    finally { setBusy(false); }
  }
  async function remove(key: string) {
    if (!window.confirm("Remove this setting? Some features may stop working.")) return;
    const response = await fetch("/api/admin/settings/" + key, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: true }) });
    if (response.ok) { await refresh(); setNotice("Setting removed."); if (selected === key) setValue(key === "theme_default" ? "light" : ""); }
    else setError("Could not remove this setting.");
  }
  return <main className="settings-manager"><div className="manager-title"><div><span className="section-kicker">SITE CONFIGURATION</span><h1>Portfolio settings</h1></div></div><p className="admin-note">Edit public profile details, links, SEO defaults, the saved theme preference, and message retention.</p><form className="settings-form" onSubmit={save}><label className="admin-field"><span>Setting</span><select value={selected} onChange={(event) => choose(event.target.value)}>{fields.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}</select></label><p className="editorial-note">{definition.note}</p><label className="admin-field"><span>{definition.label}</span>{definition.kind === "textarea" ? <textarea value={value} maxLength={6000} onChange={(event) => setValue(event.target.value)} /> : definition.kind === "select" ? <select value={value || "light"} onChange={(event) => setValue(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select> : <input type={definition.kind} required={definition.kind === "number"} min={definition.kind === "number" ? 1 : undefined} max={definition.kind === "number" ? 365 : undefined} maxLength={definition.kind === "number" ? undefined : 6000} value={value} onChange={(event) => setValue(event.target.value)} />}</label><button className="button button--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save setting"}</button><p className="form-status form-status--success" role="status">{notice}</p><p className="form-status form-status--error" role="alert">{error}</p></form><section className="record-list"><div className="form-heading"><div><span className="section-kicker">SAVED SETTINGS</span><h2>{items.length} configured</h2></div></div>{items.length ? items.map((item) => <div className="setting-row" key={item.key}><span>{fields.find((field) => field.key === item.key)?.label ?? item.key}</span><code>{String(item.value)}</code><button className="text-button text-button--danger" type="button" onClick={() => void remove(item.key)}>Remove</button></div>) : <p className="admin-muted">No settings saved yet.</p>}</section></main>;
}


