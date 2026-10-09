"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, Download, Mail, Maximize2, Minimize2, Pencil, PictureInPicture2, Plus, RotateCcw, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

type Project = { id: string; name: string; color: string };
type Entry = { id: string; projectId: string; start: number; end?: number };
type ReportSettings = { enabled: boolean; email: string; time: string; timezone: string };
type AppState = { projects: Project[]; entries: Entry[]; active: Entry | null; undo: string | null; date: string; reportSettings: ReportSettings; reportRecipientSeeded?: boolean; updatedAt: number };
type ReportResult = { configured: boolean; scheduled: boolean; error?: boolean };
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type DocumentPictureInPictureController = { requestWindow: (options?: { width?: number; height?: number; disallowReturnToOpener?: boolean }) => Promise<Window>; window: Window | null };
declare global { interface Window { documentPictureInPicture?: DocumentPictureInPictureController } }

const COLORS = ["#5bd6aa", "#5fa8e8", "#f3a95f", "#9a82e8", "#ed7d91", "#54c3cf", "#9eb45d"];
const DEFAULT_REPORT: ReportSettings = { enabled: false, email: "", time: "17:00", timezone: "Europe/Oslo" };
const FLOATING_CSS = `
  *{box-sizing:border-box}html,body{height:100%;overflow:hidden}body{margin:0;background:#0a0a0f;color:#f0f0ff;font-family:ui-rounded,"SF Pro Rounded","Avenir Next",system-ui,sans-serif;font-size:15px}.floating-pulse{padding:9px;height:100dvh;display:flex;flex-direction:column;gap:8px;overflow:hidden}.floating-head{display:flex;align-items:center;justify-content:space-between;gap:7px;flex-shrink:0}.floating-brand{display:flex;align-items:center;gap:6px;font-weight:800;font-size:14px}.floating-brand i{width:24px;height:24px;border-radius:8px;background:#17171f;color:#8b9dff;display:grid;place-items:center;font-style:normal}.floating-status{font-size:12px;color:#a0a0b5;white-space:nowrap}.floating-status:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#31a679;margin-right:5px}.floating-active{background:linear-gradient(145deg,#22253c,#14141e);color:#f0f0ff;border-radius:14px;padding:10px 12px;flex-shrink:0}.floating-active small{display:block;color:#b2c9c6;text-transform:uppercase;letter-spacing:.1em;font-weight:700;font-size:10px}.floating-active strong{display:block;font-size:15px;line-height:1.25;margin:4px 0 2px;overflow-wrap:anywhere}.floating-active b{font-size:19px;font-variant-numeric:tabular-nums}.floating-grid{display:grid;grid-template-columns:1fr;grid-auto-rows:min-content;align-content:start;gap:5px;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:1px 2px 1px 1px;overscroll-behavior:contain}.floating-project{border:1px solid #30303e;background:#17171f;color:#f0f0ff;border-radius:11px;min-height:40px;padding:7px 10px;text-align:left;font-size:14px;font-weight:750;display:grid;grid-template-columns:12px minmax(0,1fr);align-items:center;gap:9px;line-height:1.2;overflow-wrap:anywhere}.floating-project.active{background:#25283f;border:2px solid #8b9dff}.floating-project i{display:block;width:10px;height:10px;border-radius:50%;margin:0}.floating-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex-shrink:0}.floating-actions button{border:1px solid #30303e;border-radius:11px;min-height:38px;background:#17171f;color:#f0f0ff;font-weight:750}.floating-actions button.primary{background:#8b9dff;border-color:#8b9dff;color:#13172f}.floating-actions button:disabled{opacity:.45}
`;

const dayKey = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const fresh = (projects?: Project[], reportSettings: ReportSettings = DEFAULT_REPORT): AppState => ({ projects: projects ?? [
  { id: "p1", name: "Prosjekt 102 · Gitmark", color: COLORS[0] },
  { id: "p2", name: "Prosjekt 118 · Kunde Hansen", color: COLORS[1] },
  { id: "p3", name: "Prosjekt 124 · Ombygging", color: COLORS[2] },
  { id: "internal", name: "Internt", color: COLORS[3] },
], entries: [], active: null, undo: null, date: dayKey(), reportSettings, updatedAt: Date.now() });

function normalizeState(value: AppState, userEmail?: string | null): AppState {
  const normalized = { ...value, updatedAt: Number(value.updatedAt) || Date.now() };
  return { ...normalized, reportSettings: { ...DEFAULT_REPORT, ...(normalized.reportSettings ?? {}), email: normalized.reportSettings?.email || userEmail || DEFAULT_REPORT.email } };
}

function newerState(server: AppState | null, local: AppState | null) {
  if (!server) return local;
  if (!local) return server;
  return (Number(local.updatedAt) || 0) > (Number(server.updatedAt) || 0) ? local : server;
}

function minutes(ms: number) { const n = Math.max(0, Math.round(ms / 60000)); if (n < 60) return `${n} min`; const h = Math.floor(n / 60), m = n % 60; return `${h} t${m ? ` ${m} min` : ""}`; }
function time(ts: number) { return new Date(ts).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" }); }
function duration(entry: Entry, now = Date.now()) { return Math.max(0, (entry.end ?? now) - entry.start); }

function TimeSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hours = "00", mins = "00"] = value.split(":");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"hours" | "minutes">("hours");
  const [draftHour, setDraftHour] = useState(hours);
  const openPicker = () => { setDraftHour(hours); setStep("hours"); setOpen(true); };
  const chooseMinute = (minute: string) => { onChange(`${draftHour}:${minute}`); setOpen(false); setStep("hours"); };
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7, maxHeight: "42vh", overflowY: "auto" as const, padding: 2 };
  const buttonStyle = { minHeight: 42, border: "1px solid var(--line)", borderRadius: 11, background: "var(--card)", color: "var(--foreground)", fontWeight: 750, fontVariantNumeric: "tabular-nums" as const };
  return <>
    <div style={{ display: "grid", gap: 7 }}><span style={{ fontSize: ".86rem", fontWeight: 720 }}>{label}</span><button type="button" onClick={openPicker} aria-label={`${label} ${value}, åpne 24-timers klokke`} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 13, padding: 13, background: "var(--card)", color: "var(--foreground)", textAlign: "left", fontVariantNumeric: "tabular-nums", fontWeight: 650 }}>{value}</button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>{label}: {step === "hours" ? "velg time" : `${draftHour}:— velg minutter`}</DialogTitle><DialogDescription>{step === "hours" ? "Velg time fra 00 til 23." : "Når du velger minutter, lukkes tidsvelgeren automatisk."}</DialogDescription></DialogHeader>
      {step === "hours" ? <div style={gridStyle}>{HOURS.map((hour) => <button type="button" key={hour} style={{ ...buttonStyle, ...(hour === hours ? { background: "var(--accent)", borderColor: "var(--mint)" } : {}) }} onClick={() => { setDraftHour(hour); setStep("minutes"); }}>{hour}</button>)}</div> : <div style={gridStyle}>{MINUTES.map((minute) => <button type="button" key={minute} style={{ ...buttonStyle, ...(minute === mins ? { background: "var(--accent)", borderColor: "var(--mint)" } : {}) }} onClick={() => chooseMinute(minute)}>{minute}</button>)}</div>}
      <DialogFooter>{step === "minutes" && <button className="secondary" onClick={() => setStep("hours")}>Tilbake</button>}<button className="secondary" onClick={() => setOpen(false)}>Avbryt</button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}

export function TimeCtrl({ userId }: { userId: string }) {
  const LOCAL_KEY = `timectrl-v1:${userId}`;
  const [state, setState] = useState<AppState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [saveStatus, setSaveStatus] = useState<"loading" | "saving" | "saved" | "error">("loading");
  const [newOpen, setNewOpen] = useState(false), [manageOpen, setManageOpen] = useState(false), [editOpen, setEditOpen] = useState(false), [resetOpen, setResetOpen] = useState(false), [reportOpen, setReportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDays, setHistoryDays] = useState<AppState[]>([]);
  const [historyStatus, setHistoryStatus] = useState<"loading" | "ready" | "error">("ready");
  const [historyNext, setHistoryNext] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState<string | null>(null);
  const [manualProjectId, setManualProjectId] = useState("");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualError, setManualError] = useState("");
  const [newName, setNewName] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectColor, setEditProjectColor] = useState(COLORS[0]);
  const [compactMode, setCompactMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [floatingWindow, setFloatingWindow] = useState<Window | null>(null);
  const [floatingHelpOpen, setFloatingHelpOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState(DEFAULT_REPORT.email);
  const [reportTime, setReportTime] = useState(DEFAULT_REPORT.time);
  const [reportEnabled, setReportEnabled] = useState(DEFAULT_REPORT.enabled);
  const [reportStatus, setReportStatus] = useState<"idle" | "scheduled" | "error" | "unconfigured">("idle");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestState = useRef<AppState | null>(null);

  const savingRequest = useRef(false);
  const confirmedRevision = useRef<number | null>(null);

  const saveLatest = useCallback(async function sendPending() {
    const next = latestState.current;
    if (!next || savingRequest.current || confirmedRevision.current === next.updatedAt) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    savingRequest.current = true;
    setSaveStatus("saving");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    let failed = false;
    try {
      const response = await fetch("/api/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next), signal: controller.signal });
      if (!response.ok) throw new Error("save failed");
      const body = await response.json() as { report?: ReportResult; stale?: boolean };
      if (body.stale) throw new Error("newer server copy exists");
      confirmedRevision.current = next.updatedAt;
      if (body.report?.error) setReportStatus("error");
      else if (body.report?.scheduled) setReportStatus("scheduled");
      else if (body.report?.configured === false) setReportStatus("unconfigured");
      else setReportStatus("idle");
      setSaveStatus(latestState.current?.updatedAt === next.updatedAt ? "saved" : "saving");
    } catch {
      failed = true;
      setSaveStatus("error");
    } finally {
      clearTimeout(timeout);
      savingRequest.current = false;
      if (latestState.current && confirmedRevision.current !== latestState.current.updatedAt) {
        saveTimer.current = setTimeout(() => { void sendPending(); }, failed ? 15_000 : 0);
      }
    }
  }, []);

  const persist = useCallback((next: AppState) => {
    latestState.current = next;
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch { /* Server saving still protects the data. */ }
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void saveLatest(); }, 250);
  }, [LOCAL_KEY, saveLatest]);

  const update = useCallback((recipe: (current: AppState) => AppState) => {
    setState((current) => {
      if (!current) return current;
      const changed = recipe(current);
      if (changed === current) return current;
      const next = { ...changed, updatedAt: Math.max(Date.now(), current.updatedAt + 1) };
      persist(next);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) throw new Error("load failed");
        const body = await response.json() as { state: AppState | null; userEmail?: string | null };
        let local: AppState | null = null;
        try { local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null"); } catch { local = null; }
        let loaded = newerState(body.state, local);
        if (!loaded) loaded = fresh(undefined, { ...DEFAULT_REPORT, email: body.userEmail || DEFAULT_REPORT.email });
        loaded = normalizeState(loaded, body.userEmail);
        if (loaded.date !== dayKey()) loaded = fresh(loaded.projects, loaded.reportSettings);
        if (!cancelled) { setState(loaded); setSaveStatus("saved"); persist(loaded); }
      } catch {
        let local: AppState | null = null;
        try { local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null"); } catch { local = null; }
        if (!cancelled) { const normalized = local ? normalizeState(local) : null; if (normalized && normalized.date === dayKey()) { setState(normalized); persist(normalized); } setSaveStatus("error"); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [LOCAL_KEY, persist]);

  useEffect(() => {
    const flush = () => {
      if (!latestState.current || confirmedRevision.current === latestState.current.updatedAt) return;
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(latestState.current),
        keepalive: true,
      }).catch(() => undefined);
    };
    const resume = () => { void saveLatest(); };
    const onVisibilityChange = () => { if (document.visibilityState === "hidden") flush(); else resume(); };
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [saveLatest]);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(id); }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCompactMode(localStorage.getItem(`timectrl-compact:${userId}`) === "true");
      setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const installed = () => { setIsInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", installed); };
  }, [userId]);

  const project = useCallback((id: string) => state?.projects.find((item) => item.id === id) ?? { id, name: "Fjernet prosjekt", color: "#9aa8b5" }, [state]);
  const entries = useMemo(() => state ? (state.active ? [...state.entries, state.active] : state.entries) : [], [state]);
  const sums = useMemo(() => { const result: Record<string, number> = {}; for (const entry of entries) result[entry.projectId] = (result[entry.projectId] ?? 0) + duration(entry, now); return result; }, [entries, now]);
  const total = Object.values(sums).reduce((a, b) => a + b, 0);
  const snapshot = (current: AppState) => JSON.stringify({ entries: current.entries, active: current.active });

  function switchTo(projectId: string) { update((current) => { if (current.active?.projectId === projectId) return current; const timestamp = Date.now(); const closed = current.active ? [...current.entries, { ...current.active, end: timestamp }] : current.entries; return { ...current, undo: snapshot(current), entries: closed, active: { id: crypto.randomUUID(), projectId, start: timestamp } }; }); }
  function stop() { update((current) => current.active ? { ...current, undo: snapshot(current), entries: [...current.entries, { ...current.active, end: Date.now() }], active: null } : current); }
  function undo() { update((current) => { if (!current.undo) return current; const previous = JSON.parse(current.undo) as Pick<AppState, "entries" | "active">; return { ...current, ...previous, undo: null }; }); }
  function inputTime(timestamp: number) { const value = new Date(timestamp); return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`; }
  function todayAt(value: string) { const [hours, mins] = value.split(":").map(Number); const result = new Date(); result.setHours(hours, mins, 0, 0); return result.getTime(); }
  function openManualEntry() {
    if (!state) return;
    const end = new Date();
    end.setSeconds(0, 0);
    const start = new Date(end.getTime() - 30 * 60_000);
    setManualProjectId(state.projects[0]?.id ?? "");
    setManualStart(inputTime(start.getTime()));
    setManualEnd(inputTime(end.getTime()));
    setManualError("");
    setManualOpen(true);
  }
  function setManualDuration(value: number) {
    if (!manualEnd) return;
    const end = todayAt(manualEnd);
    setManualStart(inputTime(end - value * 60_000));
    setManualError("");
  }
  function addManualEntry() {
    if (!state) return;
    if (!manualProjectId || !manualStart || !manualEnd) { setManualError("Fyll ut prosjekt, starttid og sluttid."); return; }
    const start = todayAt(manualStart), end = todayAt(manualEnd);
    if (end <= start) { setManualError("Sluttiden må være senere enn starttiden."); return; }
    if (end > Date.now() + 60_000) { setManualError("Sluttiden kan ikke være fram i tid."); return; }
    const allEntries = state.active ? [...state.entries, state.active] : state.entries;
    const overlaps = allEntries.some((entry) => start < (entry.end ?? Date.now()) && end > entry.start);
    if (overlaps) { setManualError("Tidsrommet overlapper en annen registrering."); return; }
    update((current) => ({
      ...current,
      undo: snapshot(current),
      entries: [...current.entries, { id: crypto.randomUUID(), projectId: manualProjectId, start, end }].sort((a, b) => a.start - b.start),
    }));
    setManualOpen(false);
  }
  function addProject() { const name = newName.trim(); if (!name) return; update((current) => ({ ...current, projects: [...current.projects, { id: crypto.randomUUID(), name, color: COLORS[current.projects.length % COLORS.length] }] })); setNewName(""); setNewOpen(false); }
  async function loadHistory(before?: string) {
    setHistoryStatus("loading");
    try {
      const response = await fetch(`/api/history${before ? `?before=${before}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("history failed");
      const result = await response.json() as { days: AppState[]; nextBefore: string | null };
      setHistoryDays((previous) => before ? [...previous, ...result.days] : result.days);
      setHistoryNext(result.nextBefore);
      setHistoryStatus("ready");
    } catch { setHistoryStatus("error"); }
  }
  function openHistory() { setHistoryDate(null); setHistoryOpen(true); loadHistory(); }
  function beginProjectEdit(item: Project) { setManageOpen(false); setEditingProject(item); setEditProjectName(item.name); setEditProjectColor(item.color); }
  function closeProjectEdit() { setEditingProject(null); setManageOpen(true); }
  function saveProjectEdit() { const name = editProjectName.trim(); if (!editingProject || !name) return; update((current) => ({ ...current, projects: current.projects.map((item) => item.id === editingProject.id ? { ...item, name, color: editProjectColor } : item) })); closeProjectEdit(); }
  function openReportSettings() { if (!state) return; setReportEmail(state.reportSettings.email); setReportTime(state.reportSettings.time); setReportEnabled(state.reportSettings.enabled); setTestStatus("idle"); setReportOpen(true); }
  function saveReportSettings() { const email = reportEmail.trim(); if (reportEnabled && !/^\S+@\S+\.\S+$/.test(email)) return; update((current) => ({ ...current, reportSettings: { enabled: reportEnabled, email, time: reportTime, timezone: "Europe/Oslo" } })); setReportOpen(false); }
  async function sendTest() {
    const email = reportEmail.trim();
    if (!state || !/^\S+@\S+\.\S+$/.test(email)) { setTestStatus("error"); return; }
    setTestStatus("sending");
    try {
      const testState = { ...state, reportSettings: { enabled: reportEnabled, email, time: reportTime, timezone: "Europe/Oslo" } };
      const response = await fetch("/api/report/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(testState) });
      if (!response.ok) throw new Error("test failed");
      setTestStatus("sent");
    } catch { setTestStatus("error"); }
  }
  function toggleCompact() { setCompactMode((current) => { const next = !current; localStorage.setItem(`timectrl-compact:${userId}`, String(next)); return next; }); }
  async function installApp() { if (!installPrompt) { setInstallHelpOpen(true); return; } await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === "accepted") setIsInstalled(true); setInstallPrompt(null); }
  async function openFloating() {
    if (floatingWindow && !floatingWindow.closed) { floatingWindow.focus(); return; }
    if (!window.documentPictureInPicture) { setFloatingHelpOpen(true); return; }
    try {
      const rowsHeight = (state?.projects ?? []).reduce((height, item) => height + Math.max(40, Math.ceil(item.name.length / 28) * 18 + 14) + 5, 0);
      const availableHeight = Math.max(320, window.screen.availHeight - 100);
      const height = Math.min(availableHeight, Math.max(360, 170 + rowsHeight));
      const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 292, height });
      pipWindow.document.title = "timectrl";
      const style = pipWindow.document.createElement("style");
      style.textContent = FLOATING_CSS;
      pipWindow.document.head.appendChild(style);
      pipWindow.addEventListener("pagehide", () => setFloatingWindow(null), { once: true });
      setFloatingWindow(pipWindow);
    } catch { setFloatingHelpOpen(true); }
  }

  if (!state) return <main className="loading-screen"><Clock3 size={28} /><strong>{saveStatus === "error" ? "Kunne ikke hente registreringen din." : "Henter registreringen din …"}</strong>{saveStatus === "error" && <button className="secondary" onClick={() => window.location.reload()}>Prøv igjen</button>}</main>;
  const activeProject = state.active ? project(state.active.projectId) : null;
  const selectedHistory = historyDays.find((day) => day.date === historyDate);
  const historyEntries = (day: AppState) => day.active ? [...day.entries, { ...day.active, end: Math.max(day.active.start, day.updatedAt) }] : day.entries;
  const historyTotal = (day: AppState) => historyEntries(day).reduce((total, entry) => total + duration(entry), 0);
  const historySums: Record<string, number> = {};
  if (selectedHistory) for (const entry of historyEntries(selectedHistory)) historySums[entry.projectId] = (historySums[entry.projectId] ?? 0) + duration(entry);

  return <main className={compactMode ? "app-shell compact-mode" : "app-shell"}>
    <header className="topbar"><div className="brand"><div className="brand-logo-wrap"><img className="brand-logo" src="/timectrl-logo.svg" alt="timectrl" width="190" height="73" /><span className="brand-family">en del av allctrl</span><small>{new Intl.DateTimeFormat("no-NO", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</small></div></div><div className="desktop-tools">{!isInstalled && <button onClick={installApp} title="Installer timectrl"><Download size={17} /><span>Installer</span></button>}<button onClick={openFloating} title="Åpne flytende kontrollvindu"><PictureInPicture2 size={17} /><span>Flytende</span></button><button onClick={toggleCompact} title={compactMode ? "Vis full oversikt" : "Vis minivindu"}>{compactMode ? <Maximize2 size={17} /> : <Minimize2 size={17} />}<span>{compactMode ? "Full visning" : "Minivindu"}</span></button><button className="report-settings-button" onClick={openReportSettings} title="Rapportinnstillinger"><Settings size={17} /><span>Rapport</span></button><div className={`save-state ${saveStatus}`}><i />{saveStatus === "saving" ? "Lagrer" : saveStatus === "error" ? "Prøver å lagre igjen" : "Lagret automatisk"}</div></div></header>
    <section className={`active-card ${activeProject ? "" : "empty"}`} aria-live="polite"><span className="eyebrow">Jobber nå med</span><div className="active-row"><h1>{activeProject?.name ?? "Ingen registrering startet"}</h1><strong>{activeProject ? minutes(now - state.active!.start) : "Velg et prosjekt"}</strong></div><p>{activeProject ? `Startet ${time(state.active!.start)} · trykk på neste prosjekt når du bytter` : "Ett trykk starter tiden. Neste trykk avslutter automatisk."}</p></section>
    <div className="section-title"><h2>Hva jobber du med?</h2><button onClick={() => setManageOpen(true)}>Prosjekter</button></div>
    <section className="project-grid" aria-label="Prosjekter">{state.projects.map((item) => <button key={item.id} className={state.active?.projectId === item.id ? "project active-project" : "project"} onClick={() => switchTo(item.id)} aria-pressed={state.active?.projectId === item.id}><i style={{ background: item.color }} /><strong>{item.name}</strong><small>{state.active?.projectId === item.id ? "Aktiv nå" : "Trykk for å starte"}</small></button>)}<button className="project add-project" onClick={() => setNewOpen(true)}><Plus size={22} /><strong>Nytt prosjekt</strong></button></section>
    <div className="section-title summary-title"><h2>I dag</h2><div className="section-actions"><button className="manual-trigger" onClick={openManualEntry}><Plus size={16} />Legg inn tid</button><button onClick={() => setEditOpen(true)}>Rediger</button></div></div>
    <section className="summary-card"><div className="summary-total"><strong>{minutes(total)}</strong><span>registrert totalt</span></div><div className="summary-bar">{Object.entries(sums).map(([id, value]) => <i key={id} style={{ width: `${total ? value / total * 100 : 0}%`, background: project(id).color }} />)}</div><div className="summary-list">{Object.entries(sums).sort((a,b) => b[1]-a[1]).map(([id,value]) => <div key={id}><i style={{ background: project(id).color }} /><span>{project(id).name}</span><strong>{minutes(value)}</strong></div>)}{!total && <p>Ingen tid registrert ennå.</p>}</div></section>
    <button className={`report-card ${reportStatus === "error" ? "report-error" : ""}`} onClick={openReportSettings}><span className="report-icon"><Mail size={19} /></span><span><strong>{state.reportSettings.enabled ? `Dagsrapport kl. ${state.reportSettings.time}` : "Dagsrapport er av"}</strong><small>{reportStatus === "error" ? "Kunne ikke planlegge rapporten" : state.reportSettings.enabled ? state.reportSettings.email : "Trykk for å slå på"}</small></span><Settings size={17} /></button>
    <div className="section-title entries-title"><h2>Dagens bolker</h2><small>{entries.length} {entries.length === 1 ? "bolk" : "bolker"}</small></div>
    <section className="entry-list">{entries.length ? entries.slice().reverse().map((entry) => <article key={entry.id}><div><span><i style={{ background: project(entry.projectId).color }} />{project(entry.projectId).name}</span><small>{time(entry.start)}–{entry.end ? time(entry.end) : "nå"}</small></div><strong>{minutes(duration(entry, now))}</strong></article>) : <p className="empty-list">Prosjektbyttene dine dukker opp her.</p>}</section>
    <button className="secondary" onClick={openHistory} style={{ width: "100%", marginTop: 20 }}>Historikk</button>
    <button className="reset-button" onClick={() => setResetOpen(true)}><RotateCcw size={18} /> Nullstill dagen</button>
    <footer className="bottom-actions"><button className="secondary" disabled={!state.undo} onClick={undo}>Angre siste</button><button className="primary" disabled={!state.active} onClick={stop}>Stopp registrering</button></footer>

    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Nytt prosjekt</DialogTitle><DialogDescription>Prosjektet lagres varig og er klart neste gang du åpner appen.</DialogDescription></DialogHeader><label>Prosjektnavn<input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addProject(); }} placeholder="For eksempel Prosjekt 2417" /></label><DialogFooter><button className="secondary" onClick={() => setNewOpen(false)}>Avbryt</button><button className="primary" onClick={addProject}>Legg til</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>{selectedHistory ? `Registreringer ${selectedHistory.date}` : "Historikk"}</DialogTitle><DialogDescription>Dagene dine lagres hver for seg, uavhengig av om e-postrapporten blir sendt.</DialogDescription></DialogHeader>
      <div style={{ maxHeight: "55vh", overflowY: "auto", display: "grid", gap: 12 }}>
        {selectedHistory ? <>
          <strong>{minutes(historyTotal(selectedHistory))} registrert totalt</strong>
          {selectedHistory.active && <p>En bolk var fortsatt pågående ved siste lagring. Den vises frem til siste lagrede tidspunkt.</p>}
          {Object.entries(historySums).map(([id, value]) => <div key={id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>{selectedHistory.projects.find((item) => item.id === id)?.name ?? "Fjernet prosjekt"}</span><strong style={{ whiteSpace: "nowrap" }}>{minutes(value)}</strong></div>)}
          <h3>Dagens bolker</h3>
          {historyEntries(selectedHistory).map((entry) => <div key={entry.id} style={{ padding: 10, border: "1px solid #dbe5ee", borderRadius: 12 }}><strong>{selectedHistory.projects.find((item) => item.id === entry.projectId)?.name ?? "Fjernet prosjekt"}</strong><div>{time(entry.start)}–{time(entry.end!)} · {minutes(duration(entry))}</div></div>)}
        </> : <>
          {historyDays.map((day) => <button className="secondary" key={day.date} onClick={() => setHistoryDate(day.date)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><span>{day.date}</span><strong>{minutes(historyTotal(day))}</strong></button>)}
          {historyStatus === "loading" && <p>Henter historikken …</p>}
          {historyStatus === "error" && <><p role="alert">Kunne ikke hente historikken.</p><button className="secondary" onClick={() => loadHistory()}>Prøv igjen</button></>}
          {historyStatus === "ready" && !historyDays.length && <p>Ingen lagrede dager ennå.</p>}
          {historyNext && historyStatus === "ready" && <button className="secondary" onClick={() => loadHistory(historyNext)}>Vis eldre dager</button>}
        </>}
      </div>
      <DialogFooter>{selectedHistory && <button className="secondary" onClick={() => setHistoryDate(null)}>Alle dager</button>}<button className="primary" onClick={() => setHistoryOpen(false)}>Lukk</button></DialogFooter>
    </DialogContent></Dialog>
    <Dialog open={manualOpen} onOpenChange={setManualOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Legg inn tid manuelt</DialogTitle><DialogDescription>Legg inn en arbeidsbolk for i dag. Tiden tas med i oversikten og dagsrapporten.</DialogDescription></DialogHeader><label>Prosjekt<select value={manualProjectId} onChange={(event) => { setManualProjectId(event.target.value); setManualError(""); }}>{state.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="manual-time-grid"><TimeSelect label="Starttid" value={manualStart} onChange={(value) => { setManualStart(value); setManualError(""); }} /><TimeSelect label="Sluttid" value={manualEnd} onChange={(value) => { setManualEnd(value); setManualError(""); }} /></div><div className="duration-shortcuts"><span>Hurtigvalg</span><div>{[15, 30, 60].map((value) => <button key={value} type="button" onClick={() => setManualDuration(value)}>{value === 60 ? "1 time" : `${value} min`}</button>)}</div></div>{manualError && <p className="manual-error" role="alert">{manualError}</p>}<DialogFooter><button className="secondary" onClick={() => setManualOpen(false)}>Avbryt</button><button className="primary" onClick={addManualEntry}>Legg til tid</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={manageOpen} onOpenChange={setManageOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Prosjekter</DialogTitle><DialogDescription>Endre navn og farge. Registrerte timer følger prosjektet.</DialogDescription></DialogHeader><div className="manage-list">{state.projects.map((item) => <div key={item.id}><span><i style={{ background: item.color }} />{item.name}</span><div className="project-actions"><button className="edit-project" aria-label={`Rediger ${item.name}`} onClick={() => beginProjectEdit(item)}><Pencil size={17} /></button><button aria-label={`Fjern ${item.name}`} disabled={state.projects.length === 1 || state.active?.projectId === item.id} onClick={() => update((current) => ({ ...current, projects: current.projects.filter((p) => p.id !== item.id) }))}><Trash2 size={18} /></button></div></div>)}</div><DialogFooter><button className="secondary" onClick={() => setManageOpen(false)}>Lukk</button><button className="primary" onClick={() => { setManageOpen(false); setNewOpen(true); }}>Nytt prosjekt</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(editingProject)} onOpenChange={(open) => { if (!open && editingProject) closeProjectEdit(); }}><DialogContent className="modal"><DialogHeader><DialogTitle>Rediger prosjekt</DialogTitle><DialogDescription>Endringen vises også på tidligere registrerte bolker.</DialogDescription></DialogHeader><label>Prosjektnavn<input autoFocus value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveProjectEdit(); }} /></label><fieldset className="color-field"><legend>Farge</legend><div className="color-picker">{COLORS.map((color) => <button key={color} type="button" className={editProjectColor === color ? "selected" : ""} style={{ background: color }} onClick={() => setEditProjectColor(color)} aria-label={`Velg farge ${color}`} aria-pressed={editProjectColor === color} />)}</div></fieldset><DialogFooter><button className="secondary" onClick={closeProjectEdit}>Avbryt</button><button className="primary" onClick={saveProjectEdit}>Lagre endringer</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Rediger dagens bolker</DialogTitle><DialogDescription>Endre prosjekt eller slett feilregistreringer.</DialogDescription></DialogHeader><div className="manage-list edit-list">{state.entries.map((entry) => <div key={entry.id}><span><select value={entry.projectId} onChange={(e) => update((current) => ({ ...current, entries: current.entries.map((item) => item.id === entry.id ? { ...item, projectId: e.target.value } : item) }))}>{state.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><small>{time(entry.start)}–{time(entry.end!)} · {minutes(duration(entry))}</small></span><button aria-label="Slett bolk" onClick={() => update((current) => ({ ...current, entries: current.entries.filter((item) => item.id !== entry.id) }))}><Trash2 size={18} /></button></div>)}</div>{!state.entries.length && <p className="empty-list">Ingen avsluttede bolker å redigere.</p>}<DialogFooter><button className="primary" onClick={() => setEditOpen(false)}>Ferdig</button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={resetOpen} onOpenChange={setResetOpen}><AlertDialogContent className="modal"><AlertDialogHeader><AlertDialogTitle>Nullstille dagen?</AlertDialogTitle><AlertDialogDescription>Alle registrerte bolker i dag blir slettet. Prosjektknappene beholdes.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Avbryt</AlertDialogCancel><AlertDialogAction onClick={() => update((current) => fresh(current.projects, current.reportSettings))}>Nullstill</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={installHelpOpen} onOpenChange={setInstallHelpOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Installer timectrl</DialogTitle><DialogDescription>Åpne nettlesermenyen og velg «Installer timectrl» eller «Legg til i Dock». Da får appen eget ikon og åpnes i et separat vindu.</DialogDescription></DialogHeader><DialogFooter><button className="primary" onClick={() => setInstallHelpOpen(false)}>Forstått</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={floatingHelpOpen} onOpenChange={setFloatingHelpOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Flytende vindu er ikke tilgjengelig</DialogTitle><DialogDescription>Funksjonen krever en oppdatert versjon av Chrome eller Edge på PC. Åpne timectrl der og prøv igjen.</DialogDescription></DialogHeader><DialogFooter><button className="primary" onClick={() => setFloatingHelpOpen(false)}>Forstått</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={reportOpen} onOpenChange={setReportOpen}><DialogContent className="modal"><DialogHeader><DialogTitle>Dagsrapport</DialogTitle><DialogDescription>Innstillingene gjelder bare din bruker. Rapporten sendes automatisk selv om appen er lukket.</DialogDescription></DialogHeader><div className="report-toggle"><span><strong>Automatisk rapport</strong><small>Send en oppsummering på slutten av dagen</small></span><Switch checked={reportEnabled} onCheckedChange={setReportEnabled} aria-label="Automatisk rapport" /></div><label>E-postadresse<input type="email" value={reportEmail} disabled={!reportEnabled} onChange={(event) => { setReportEmail(event.target.value); setTestStatus("idle"); }} placeholder="navn@firma.no" /></label><label>Tidspunkt<input type="time" value={reportTime} disabled={!reportEnabled} onChange={(event) => setReportTime(event.target.value)} /></label><p className="report-note">Tidssone: Norge. Du kan endre dette når som helst.</p>{testStatus === "sent" && <p className="report-feedback success">Testrapporten er sendt til {reportEmail.trim()}.</p>}{testStatus === "error" && <p className="report-feedback error">Testrapporten kunne ikke sendes. Kontroller adressen og prøv igjen.</p>}<DialogFooter><button className="secondary test-report" disabled={!reportEnabled || testStatus === "sending"} onClick={sendTest}>{testStatus === "sending" ? "Sender …" : "Send test nå"}</button><button className="primary" onClick={saveReportSettings}>Lagre</button></DialogFooter></DialogContent></Dialog>
    {floatingWindow && !floatingWindow.closed && createPortal(<div className="floating-pulse"><div className="floating-head"><div className="floating-brand"><img src={new URL("/timectrl-logo.svg", window.location.origin).href} alt="timectrl" width="116" height="45" /></div><div className="floating-status">{saveStatus === "error" ? "Ikke lagret" : saveStatus === "saving" ? "Lagrer" : "Lagret"}</div></div><section className="floating-active"><small>Jobber nå med</small><strong>{activeProject?.name ?? "Ingen registrering startet"}</strong><b>{activeProject ? minutes(now - state.active!.start) : "Velg prosjekt"}</b></section><div className="floating-grid">{state.projects.map((item) => <button key={item.id} className={`floating-project ${state.active?.projectId === item.id ? "active" : ""}`} onClick={() => switchTo(item.id)}><i style={{ background: item.color }} />{item.name}</button>)}</div><div className="floating-actions"><button onClick={() => window.focus()}>Full oversikt</button><button className="primary" disabled={!state.active} onClick={stop}>Stopp</button></div></div>, floatingWindow.document.body)}
  </main>;
}
