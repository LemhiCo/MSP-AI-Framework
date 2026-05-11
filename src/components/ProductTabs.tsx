const TABS = [
  { id: "digest", label: "Copilot Digest", href: "https://digest.lemhi.ai" },
  { id: "atlas", label: "Atlas Apps", href: "https://atlas.lemhi.ai" },
  { id: "magic", label: "MAGIC Framework", href: "https://framework.lemhi.ai" },
];

export default function ProductTabs({ active = "magic" }: { active?: "digest" | "atlas" | "magic" }) {
  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="flex items-center gap-1 px-3 sm:px-4 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <a
              key={t.id}
              href={t.href}
              target={isActive ? undefined : "_blank"}
              rel={isActive ? undefined : "noopener noreferrer"}
              className={`text-[11px] sm:text-xs font-medium px-3 py-1.5 border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {t.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}