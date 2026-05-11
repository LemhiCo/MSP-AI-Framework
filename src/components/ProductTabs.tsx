import { ExternalLink } from "lucide-react";

const TABS = [
  {
    id: "digest",
    label: "Copilot Digest",
    href: "https://digest.lemhi.ai",
    tooltip:
      "Stay ahead of Microsoft Copilot releases — get notified when Microsoft ships Copilot features. Updates on what's Launched and Rolling out, sourced directly from the M365 Roadmap.",
  },
  {
    id: "atlas",
    label: "Atlas Apps",
    href: "https://atlas.lemhi.ai",
    tooltip:
      "Atlas · Lemhi AI Catalog — Know what your apps are doing with AI before someone asks. A plain-English reference for the AI features, data policies, and integrations behind the SaaS your customers already use. No hype, no marketing cycles — just what's actually shipping.",
  },
  {
    id: "magic",
    label: "MAGIC Framework",
    href: "https://framework.lemhi.ai",
    tooltip:
      "The MAGIC Framework is an MSP-native, controls-first framework for enabling AI across customer environments in a way that is repeatable, governable, and monetizable.",
  },
];

export default function ProductTabs({ active = "magic" }: { active?: "digest" | "atlas" | "magic" }) {
  return (
    <nav className="w-full bg-white border-b border-border">
      <div className="flex items-center gap-4 sm:gap-8 px-4 sm:px-8 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <a
              key={t.id}
              href={t.href}
              title={t.tooltip}
              target={isActive ? undefined : "_blank"}
              rel={isActive ? undefined : "noopener noreferrer"}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold py-3 border-b-2 -mb-px whitespace-nowrap transition-colors text-primary ${
                isActive
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <span>{t.label}</span>
              {!isActive && <ExternalLink className="w-3 h-3 opacity-70" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
}