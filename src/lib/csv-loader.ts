import Papa from "papaparse";

export interface Control {
  uid: string;
  controlId: string;
  implementationGuard: string;
  contentArea: string;
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
}

async function fetchCSV<T>(path: string, mapFn: (row: Record<string, string>) => T): Promise<T[]> {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (parsed.data as Record<string, string>[]).map(mapFn);
}

const mapControlRow = (r: Record<string, string>): Control => ({
  uid: r["UID"] || "",
  controlId: r["Control ID"] || "",
  implementationGuard: r["Implementation Guard"] || "",
  contentArea: r["Content Area"] || "",
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

/** The 5 implementation guards */
export const IG_LEVELS = ["IG1", "IG2", "IG3", "IG4", "IG5"] as const;

export const IG_META: Record<string, { label: string; name: string; sub: string }> = {
  IG1: { label: "1 – Critical Foundation", name: "Critical Foundation", sub: "Before any AI tool is enabled" },
  IG2: { label: "2 – Platform Prerequisites", name: "Platform Prerequisites", sub: "Before Copilot or first agent" },
  IG3: { label: "3 – Operational", name: "Operational", sub: "Once AI is live & managed" },
  IG4: { label: "4 – Advanced Configuration", name: "Advanced Configuration", sub: "Custom agents & hardening" },
  IG5: { label: "5 – Agentic Enterprise Readiness", name: "Agentic Enterprise Readiness", sub: "Autonomous agentic AI" },
};

/** Content areas (for color dots based on control ID prefix) */
export const CONTENT_AREAS = [
  { id: "STR", name: "Strategy & Buy-In", color: "var(--ca-str)" },
  { id: "SKL", name: "People & Skills", color: "var(--ca-skl)" },
  { id: "GOV", name: "Policy & Governance", color: "var(--ca-gov)" },
  { id: "TEC", name: "Technical Readiness", color: "var(--ca-tec)" },
  { id: "CPL", name: "Copilot Readiness", color: "var(--ca-cpl)" },
  { id: "PRC", name: "Process Mapping", color: "var(--ca-prc)" },
  { id: "DAT", name: "Data Security & Tagging", color: "var(--ca-dat)" },
  { id: "OBS", name: "AI Observability", color: "var(--ca-obs)" },
  { id: "DEP", name: "AI Tooling & Deployment", color: "var(--ca-dep)" },
] as const;

export const LIFECYCLE_TRIGGERS = [
  "Onboarding",
  "QBR",
  "Employee Onboarding",
  "Employee Offboarding",
  "Project",
  "Security Incident",
] as const;

/** Helper: get content area prefix from control ID */
export function getContentAreaPrefix(control: Control): string {
  return control.controlId.split("-")[0];
}
