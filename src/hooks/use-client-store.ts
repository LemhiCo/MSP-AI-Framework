import { useState, useCallback, useSyncExternalStore } from "react";
import {
  getClients,
  createClient,
  deleteClient,
  setControlStatus,
  type ClientProfile,
  type ControlStatus,
} from "@/lib/client-store";

const STORAGE_KEY = "ai-framework-clients";

let listeners: (() => void)[] = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function notify() {
  listeners.forEach((l) => l());
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

export function useClientStore() {
  const raw = useSyncExternalStore(subscribe, getSnapshot);
  const clients: ClientProfile[] = JSON.parse(raw);

  const addClient = useCallback((name: string) => {
    const c = createClient(name);
    notify();
    return c;
  }, []);

  const removeClient = useCallback((id: string) => {
    deleteClient(id);
    notify();
  }, []);

  const updateStatus = useCallback((clientId: string, controlId: string, status: ControlStatus) => {
    setControlStatus(clientId, controlId, status);
    notify();
  }, []);

  return { clients, addClient, removeClient, updateStatus };
}
