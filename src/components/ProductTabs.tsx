import { ExternalLink } from "lucide-react";

const TABS = [
  { id: "digest", label: "Copilot Digest", href: "https://digest.lemhi.ai" },
  { id: "atlas", label: "Atlas Apps", href: "https://atlas.lemhi.ai" },
  { id: "magic", label: "MAGIC Framework", href: "https://framework.lemhi.ai" },
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