import Papa from "papaparse";

export interface Control {
  controlId: string;
  pillar: string;
  ig: string;
  safeguardTitle: string;
  customerObjective: string;
  detailedRequirement: string;
  lifecycleTrigger: string;
  cadence: string;
  primaryStakeholder: string;
  microsoftTool: string;
  genericTooling: string;
  evidenceOfCompletion: string;
  appliesTo: string;
  notesGuardrails: string;
}

export interface AssessmentRow {
  controlId: string;
  pillar: string;
  ig: string;
  safeguardTitle: string;
  lifecycleTrigger: string;
  cadence: string;
  status: string;
  owner: string;
  dueDate: string;
  microsoftTool: string;
  genericTooling: string;
  evidenceNotes: string;
  priority: string;
}

async function fetchCSV<T>(path: string, mapFn: (row: Record<string, string>) => T): Promise<T[]> {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (parsed.data as Record<string, string>[]).map(mapFn);
}

export async function loadControls(): Promise<Control[]> {
  return fetchCSV("/data/controls.csv", (r) => ({
    controlId: r["Control ID"] || "",
    pillar: r["Pillar"] || "",
    ig: r["IG"] || "",
    safeguardTitle: r["Safeguard Title"] || "",
    customerObjective: r["Customer Objective"] || "",
    detailedRequirement: r["Detailed Requirement"] || "",
    lifecycleTrigger: r["Lifecycle Trigger"] || "",
    cadence: r["Cadence"] || "",
    primaryStakeholder: r["Primary Stakeholder"] || "",
    microsoftTool: r["Microsoft Tool Recommendation"] || "",
    genericTooling: r["Generic Tooling Category"] || "",
    evidenceOfCompletion: r["Evidence of Completion"] || "",
    appliesTo: r["Applies To"] || "",
    notesGuardrails: r["Notes / Guardrails"] || "",
  }));
}

export async function loadAssessment(): Promise<AssessmentRow[]> {
  return fetchCSV("/data/assessment.csv", (r) => ({
    controlId: r["Control ID"] || "",
    pillar: r["Pillar"] || "",
    ig: r["IG"] || "",
    safeguardTitle: r["Safeguard Title"] || "",
    lifecycleTrigger: r["Lifecycle Trigger"] || "",
    cadence: r["Cadence"] || "",
    status: r["Status"] || "Not Started",
    owner: r["Owner"] || "",
    dueDate: r["Due Date"] || "",
    microsoftTool: r["Microsoft Tool Recommendation"] || "",
    genericTooling: r["Generic Tooling Category"] || "",
    evidenceNotes: r["Evidence Link / Notes"] || "",
    priority: r["Priority"] || "",
  }));
}

export const PILLARS = [
  { id: "STR", name: "Strategy & Buy-In", color: "var(--pillar-str)" },
  { id: "GOV", name: "Policy & Governance", color: "var(--pillar-gov)" },
  { id: "TEC", name: "Technical Readiness", color: "var(--pillar-tec)" },
  { id: "PRC", name: "Process Mapping", color: "var(--pillar-prc)" },
  { id: "DAT", name: "Data Security & Tagging", color: "var(--pillar-dat)" },
  { id: "OBS", name: "AI Observability", color: "var(--pillar-obs)" },
  { id: "DEP", name: "AI Tooling & Deployment", color: "var(--pillar-dep)" },
] as const;

export const IG_LEVELS = ["IG1", "IG2", "IG3"] as const;

export const LIFECYCLE_TRIGGERS = [
  "Onboarding",
  "QBR",
  "Employee Onboarding",
  "Employee Offboarding",
  "Project",
  "Security Incident",
] as const;
