import type { SupabaseClient } from "@supabase/supabase-js";
const env = process.env;
import { deleteScheduledReport, readScheduledReport, writeScheduledReport } from "@/db/reports";

type Project = { id: string; name: string; color: string };
type Entry = { id: string; projectId: string; start: number; end?: number };
type ReportSettings = { enabled: boolean; email: string; time: string; timezone?: string };
export type ReportState = { projects: Project[]; entries: Entry[]; active: Entry | null; date: string; reportSettings?: ReportSettings };

export type ReportSyncResult = {
  configured: boolean;
  scheduled: boolean;
  scheduledAt?: string;
  error?: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

function zonedTime(date: string, clockValue: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = clockValue.split(":").map(Number);
  const initial = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(initial));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const represented = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return new Date(initial - (represented - initial));
}

function minutes(milliseconds: number) {
  const value = Math.max(0, Math.round(milliseconds / 60000));
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60), rest = value % 60;
  return `${hours} t${rest ? ` ${rest} min` : ""}`;
}

function clock(timestamp: number) {
  return new Intl.DateTimeFormat("no-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function reportHtml(state: ReportState, reportAt: number) {
  const projects = new Map(state.projects.map((project) => [project.id, project]));
  const entries = state.active ? [...state.entries, { ...state.active, end: reportAt }] : state.entries;
  const sums = new Map<string, number>();
  for (const entry of entries) sums.set(entry.projectId, (sums.get(entry.projectId) ?? 0) + Math.max(0, (entry.end ?? reportAt) - entry.start));
  const total = [...sums.values()].reduce((sum, value) => sum + value, 0);
  const summary = [...sums.entries()].sort((a, b) => b[1] - a[1]).map(([id, value]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e7edf3">${escapeHtml(projects.get(id)?.name ?? "Fjernet prosjekt")}</td><td style="padding:8px 0;border-bottom:1px solid #e7edf3;text-align:right;font-weight:700">${minutes(value)}</td></tr>`).join("");
  const intervals = entries.map((entry) => `<tr><td style="padding:6px 0;color:#41566c">${escapeHtml(projects.get(entry.projectId)?.name ?? "Fjernet prosjekt")}</td><td style="padding:6px 0;text-align:right;color:#41566c">${clock(entry.start)}–${clock(entry.end ?? reportAt)}</td></tr>`).join("");
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#10243e"><h1 style="font-size:24px">Dagsrapport fra timectrl</h1><p style="color:#66788b">${escapeHtml(state.date)}</p><div style="background:#10243e;color:white;border-radius:16px;padding:20px;margin:18px 0"><div style="font-size:13px;color:#bdd0e3">REGISTRERT TOTALT</div><strong style="font-size:30px">${minutes(total)}</strong></div><h2 style="font-size:18px">Per prosjekt</h2><table style="width:100%;border-collapse:collapse">${summary || '<tr><td style="padding:8px 0">Ingen tid registrert.</td></tr>'}</table><h2 style="font-size:18px;margin-top:24px">Dagens bolker</h2><table style="width:100%;border-collapse:collapse">${intervals || '<tr><td style="padding:8px 0">Ingen bolker registrert.</td></tr>'}</table><p style="margin-top:26px;color:#8795a4;font-size:12px">Rapporten ble opprettet automatisk av timectrl.</p></div>`;
}

async function resend(path: string, init: RequestInit, apiKey: string) {
  return fetch(`https://api.resend.com${path}`, { ...init, headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", ...(init.headers ?? {}) } });
}

async function sendEmail(state: ReportState, recipient: string, reportAt: number, scheduledAt?: string) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Resend is not configured");
  const response = await resend("/emails", {
    method: "POST",
    body: JSON.stringify({
      from: env.RESEND_FROM || "timectrl <timectrl@allctrl.no>",
      to: [recipient],
      subject: `timectrl · ${scheduledAt ? "Dagsrapport" : "Testrapport"} ${state.date}`,
      html: reportHtml(state, reportAt),
      ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
    }),
  }, apiKey);
  if (!response.ok) throw new Error(`Resend send failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<{ id: string }>;
}

export async function syncScheduledReport(userId: string, state: ReportState, client: SupabaseClient): Promise<ReportSyncResult> {
  const settings = state.reportSettings;
  if (!env.RESEND_API_KEY) return { configured: false, scheduled: false };

  const previous = await readScheduledReport(userId, client);
  if (!settings?.enabled || !/^\S+@\S+\.\S+$/.test(settings.email) || !/^\d{2}:\d{2}$/.test(settings.time)) {
    if (previous && previous.report_date === state.date) {
      const canceled = await resend(`/emails/${previous.email_id}/cancel`, { method: "POST" }, env.RESEND_API_KEY);
      if (canceled.ok) await deleteScheduledReport(userId, client);
    }
    return { configured: true, scheduled: false };
  }

  const scheduled = zonedTime(state.date, settings.time, settings.timezone || "Europe/Oslo");
  if (scheduled.getTime() <= Date.now() + 30_000) return { configured: true, scheduled: false };

  const body = await sendEmail(state, settings.email, scheduled.getTime(), scheduled.toISOString());
  await writeScheduledReport(userId, body.id, state.date, scheduled.toISOString(), client);
  if (previous && previous.report_date === state.date) {
    await resend(`/emails/${previous.email_id}/cancel`, { method: "POST" }, env.RESEND_API_KEY).catch(() => undefined);
  }
  return { configured: true, scheduled: true, scheduledAt: scheduled.toISOString() };
}

export async function sendTestReport(state: ReportState) {
  const settings = state.reportSettings;
  if (!settings?.email || !/^\S+@\S+\.\S+$/.test(settings.email)) throw new Error("Invalid report recipient");
  return sendEmail(state, settings.email, Date.now());
}
