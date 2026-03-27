import { useState } from "react";
import ContributorsTicker from "./ContributorsTicker";
import { useIsMobile } from "@/hooks/use-mobile";

const WAITLIST_KEY = "lemhi-waitlist-signed-up";
const ENDPOINT = "https://vpewefckhacxgbypzbmh.supabase.co/functions/v1/notify-waitlist";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXdlZmNraGFjeGdieXB6Ym1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDY5MzksImV4cCI6MjA4NzAyMjkzOX0.61WY66Bko6_N6R8BzZz0C0r6gIC2QNCeHl1PawmXveo";

const ROLES = ["MSP Owner", "VCIO", "Sales Leader", "Technical Leader", "Other"];

export function useWaitlistGate() {
  const [isPreview] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview") === "true";
    if (preview) {
      // Strip preview param from URL so copied links don't bypass the gate
      params.delete("preview");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
    return preview;
  });

  const [signedUp, setSignedUp] = useState(() => {
    if (isPreview) return true;
    try {
      return localStorage.getItem(WAITLIST_KEY) === "true";
    } catch {
      return false;
    }
  });

  const markSignedUp = () => {
    localStorage.setItem(WAITLIST_KEY, "true");
    setSignedUp(true);
  };

  return { signedUp, markSignedUp };
}

export default function WaitlistGate({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("MSP Owner");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !company.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          company: company.trim(),
          role,
          source: "framework-app",
        }),
      });

      if (!res.ok) throw new Error();
      onComplete();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/40" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl p-6 animate-fade-up" style={{ animationDuration: "400ms" }}>
        <div className="text-center mb-5">
          <h2 className="text-xl font-serif font-semibold">Join the Expedition</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            The AI Controls Framework is an open source, community-driven project built by MSPs and advisors who believe AI governance shouldn't be gatekept. Sign up to explore, contribute, and help shape the standard.
          </p>
        </div>

        <div className="mb-5 rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">What you'll get</p>
          <ul className="text-xs text-foreground/80 space-y-1 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✦</span>88+ controls across 7 pillars — Strategy to Deployment</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✦</span>Gate-based scoring (Baseline, Scale, Advanced)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✦</span>Edit, improve, and suggest changes back to the community</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✦</span>Downloadable CSV/XLSX — take it with you, make it yours</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✦</span>Your name in the contributors list when your changes ship</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Join the Expedition"}
          </button>
        </form>

        <a
          href="https://github.com/LemhiCo/MSP-AI-Framework/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[11px] text-muted-foreground/60 hover:text-muted-foreground mt-4 transition-colors"
        >
          I'd rather not — just take me to the framework on GitHub →
        </a>
      </div>

      <ContributorsTicker />
    </div>
  );
}
