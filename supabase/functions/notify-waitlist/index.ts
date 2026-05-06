import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLES = new Set(["MSP Owner", "VCIO", "Sales Leader", "Technical Leader", "Other"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const company = String(body.company ?? "").trim();
  const role = String(body.role ?? "").trim();
  const source = String(body.source ?? "").trim().slice(0, 64) || "unknown";

  const errors: Record<string, string> = {};
  if (!name || name.length > 100) errors.name = "Name is required (max 100 chars).";
  if (!email || !isEmail(email) || email.length > 255) errors.email = "Valid email required.";
  if (!company || company.length > 100) errors.company = "Company is required (max 100 chars).";
  if (!ROLES.has(role)) errors.role = "Invalid role.";
  if (Object.keys(errors).length) return jsonResponse({ error: "Validation failed", fields: errors }, 400);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { error } = await admin
    .from("waitlist")
    .upsert(
      { name, email, company, role, source },
      { onConflict: "email,source", ignoreDuplicates: true },
    );

  if (error) {
    console.error("Insert error:", error);
    return jsonResponse({ error: "Could not save signup" }, 500);
  }

  // Also forward to the original external waitlist (best-effort, non-blocking failure)
  try {
    const EXTERNAL_ENDPOINT = "https://vpewefckhacxgbypzbmh.supabase.co/functions/v1/notify-waitlist";
    const EXTERNAL_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXdlZmNraGFjeGdieXB6Ym1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDY5MzksImV4cCI6MjA4NzAyMjkzOX0.61WY66Bko6_N6R8BzZz0C0r6gIC2QNCeHl1PawmXveo";
    const fwd = await fetch(EXTERNAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EXTERNAL_ANON_KEY },
      body: JSON.stringify({ name, email, company, role, source }),
    });
    if (!fwd.ok) {
      console.error("External waitlist forward failed:", fwd.status, await fwd.text());
    }
  } catch (e) {
    console.error("External waitlist forward exception:", e);
  }

  return jsonResponse({ ok: true });
});