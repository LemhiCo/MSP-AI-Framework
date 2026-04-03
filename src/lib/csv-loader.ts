import Papa from "papaparse";

export interface Control {
  controlId: string;
  implementationPillar: string;
  criticalityLevel: string;
  contentArea: string;
  ig: string;
  safeguardTitle: string;
  customerObjective: string;
  detailedRequirement: string;
  lifecycleTrigger: string;
  cadence: string;
  primaryStakeholder: string;
  evidenceOfCompletion: string;
  minStatusToPass: string;
  minEvidenceToPass: string;
  failCondition: string;
  whyItMatters: string;
  whoCaresMost: string;
  firstRequiredWhen: string;
}

async function fetchCSV<T>(path: string, mapFn: (row: Record<string, string>) => T): Promise<T[]> {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (parsed.data as Record<string, string>[]).map(mapFn);
}

const mapControlRow = (r: Record<string, string>): Control => ({
  controlId: r["Control ID"] || "",
  implementationPillar: r["Implementation Pillar"] || "",
  criticalityLevel: r["Criticality Level"] || "",
  contentArea: r["Content Area"] || "",
  ig: r["IG"] || "",
  safeguardTitle: r["Safeguard Title"] || "",
  customerObjective: r["Customer Objective"] || "",
  detailedRequirement: r["Detailed Requirement"] || "",
  lifecycleTrigger: r["Lifecycle Trigger"] || "",
  cadence: r["Cadence"] || "",
  primaryStakeholder: r["Primary Stakeholder"] || "",
  evidenceOfCompletion: r["Evidence of Completion"] || "",
  minStatusToPass: r["Minimum Status to Pass"] || "",
  minEvidenceToPass: r["Minimum Evidence to Pass"] || "",
  failCondition: r["Fail Condition"] || "",
  whyItMatters: r["Why it Matters"] || "",
  whoCaresMost: r["Who Cares Most (Customer)"] || "",
  firstRequiredWhen: r["First Required When"] || "",
});

export async function loadControls(): Promise<Control[]> {
  return fetchCSV("https://raw.githubusercontent.com/LemhiCo/MSP-AI-Framework/main/public/data/controls.csv", mapControlRow);
}

export function parseControlsCSV(csvText: string): Control[] {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (parsed.data as Record<string, string>[]).map(mapControlRow);
}

/** The 5 implementation pillars (v3) */
export const PILLARS = [
  { id: "P1", name: "Critical Foundation", criticality: "Critical", color: "var(--pillar-p1)" },
  { id: "P2", name: "Platform Prerequisites", criticality: "High", color: "var(--pillar-p2)" },
  { id: "P3", name: "Operational Governance", criticality: "Medium-High", color: "var(--pillar-p3)" },
  { id: "P4", name: "Advanced Configuration", criticality: "Medium", color: "var(--pillar-p4)" },
  { id: "P5", name: "Agentic Enterprise Readiness", criticality: "Advanced", color: "var(--pillar-p5)" },
] as const;

/** Pillar label mapping from CSV values to pillar IDs */
export const PILLAR_FROM_CSV: Record<string, string> = {
  "Pillar 1 – Critical Foundation": "P1",
  "Pillar 1 — Critical Foundation": "P1",
  "Pillar 2 – Platform Prerequisites": "P2",
  "Pillar 2 — Platform Prerequisites": "P2",
  "Pillar 3 – Operational Governance": "P3",
  "Pillar 3 — Operational Governance": "P3",
  "Pillar 4 – Advanced Configuration": "P4",
  "Pillar 4 — Advanced Configuration": "P4",
  "Pillar 5 – Agentic Enterprise Readiness": "P5",
  "Pillar 5 — Agentic Enterprise Readiness": "P5",
};

/** Content areas (for color dots based on control ID prefix) */
export const CONTENT_AREAS = [
  { id: "STR", name: "Strategy & Buy-In", color: "var(--ca-str)" },
  { id: "GOV", name: "Policy & Governance", color: "var(--ca-gov)" },
  { id: "TEC", name: "Technical Readiness", color: "var(--ca-tec)" },
  { id: "CPL", name: "Copilot Readiness", color: "var(--ca-cpl)" },
  { id: "PRC", name: "Process Mapping", color: "var(--ca-prc)" },
  { id: "DAT", name: "Data Security & Tagging", color: "var(--ca-dat)" },
  { id: "OBS", name: "AI Observability", color: "var(--ca-obs)" },
  { id: "DEP", name: "AI Tooling & Deployment", color: "var(--ca-dep)" },
  { id: "SKL", name: "People & Skills", color: "var(--ca-skl)" },
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

/** Helper: get pillar ID from a control's implementationPillar CSV value */
export function getPillarId(control: Control): string {
  return PILLAR_FROM_CSV[control.implementationPillar] || "P1";
}

/** Helper: get content area prefix from control ID */
export function getContentAreaPrefix(control: Control): string {
  return control.controlId.split("-")[0];
}
