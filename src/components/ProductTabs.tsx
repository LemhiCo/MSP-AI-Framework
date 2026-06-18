import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

type Property = { name: string; url: string; description: string };

const PROPERTIES_URL = "https://vpewefckhacxgbypzbmh.supabase.co/functions/v1/properties";

const FALLBACK: Property[] = [
  { name: "MAGIC Framework", url: "https://framework.lemhi.ai", description: "An MSP-native, controls-first framework for enabling AI across customer environments in a way that is repeatable, governable, and monetizable." },
];

function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export default function ProductTabs({ active = "magic" }: { active?: string }) {
  const [tabs, setTabs] = useState<Property[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch(PROPERTIES_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.properties)) setTabs(data.properties);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const currentHost = typeof window !== "undefined" ? window.location.hostname.replace(/^www\./, "") : "";
  const orderedTabs = [...tabs].sort((a, b) => {
    const aIsMagic = a.name.toLowerCase().includes("magic");
    const bIsMagic = b.name.toLowerCase().includes("magic");
    return Number(aIsMagic) - Number(bIsMagic);
  });

  return (
    <nav className="w-full bg-white border-b border-border relative z-50 overflow-hidden">
      <div className="flex items-center justify-end gap-4 sm:gap-8 px-4 sm:px-8 flex-nowrap whitespace-nowrap">
        {orderedTabs.map((t) => {
          const tabHost = hostOf(t.url);
          const isActive = currentHost
            ? tabHost === currentHost
            : t.name.toLowerCase().includes(active.toLowerCase());
          return (
            <div key={t.url} className="relative group">
              <a
                href={t.url}
                target={isActive ? undefined : "_blank"}
                rel={isActive ? undefined : "noopener noreferrer"}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold py-3 border-b-2 -mb-px whitespace-nowrap transition-colors text-primary ${
                  isActive
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <span>{t.name}</span>
                {!isActive && <ExternalLink className="w-3 h-3 opacity-70" />}
              </a>
              <div className="pointer-events-none absolute left-0 top-full mt-1 w-72 rounded-md border border-border bg-card text-foreground text-xs leading-relaxed shadow-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-[100]">
                {t.description}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}