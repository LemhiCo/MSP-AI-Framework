// localStorage-based client progress tracker

export interface ClientProfile {
  id: string;
  name: string;
  createdAt: string;
  controlStatuses: Record<string, ControlStatus>;
}

export type ControlStatus = "not-started" | "in-progress" | "complete" | "not-applicable";

const STORAGE_KEY = "ai-framework-clients";

function getAll(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(clients: ClientProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function getClients(): ClientProfile[] {
  return getAll();
}

export function getClient(id: string): ClientProfile | undefined {
  return getAll().find((c) => c.id === id);
}

export function createClient(name: string): ClientProfile {
  const client: ClientProfile = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    controlStatuses: {},
  };
  const all = getAll();
  all.push(client);
  saveAll(all);
  return client;
}

export function deleteClient(id: string) {
  saveAll(getAll().filter((c) => c.id !== id));
}

export function setControlStatus(clientId: string, controlId: string, status: ControlStatus) {
  const all = getAll();
  const client = all.find((c) => c.id === clientId);
  if (!client) return;
  client.controlStatuses[controlId] = status;
  saveAll(all);
}

export function getClientProgress(client: ClientProfile, totalControls: number) {
  const statuses = Object.values(client.controlStatuses);
  const complete = statuses.filter((s) => s === "complete").length;
  const inProgress = statuses.filter((s) => s === "in-progress").length;
  const na = statuses.filter((s) => s === "not-applicable").length;
  return {
    complete,
    inProgress,
    notApplicable: na,
    notStarted: totalControls - complete - inProgress - na,
    percentage: totalControls > 0 ? Math.round((complete / (totalControls - na || 1)) * 100) : 0,
  };
}
