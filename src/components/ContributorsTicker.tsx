import { useEffect, useState } from "react";
import Papa from "papaparse";

interface Contributor {
  handle: string;
}

export default function ContributorsTicker() {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    fetch("/data/contributors.csv")
      .then((r) => r.text())
      .then((text) => {
        const parsed = Papa.parse<Contributor>(text, { header: true, skipEmptyLines: true });
        setContributors(parsed.data);
      });
  }, []);

  if (contributors.length === 0) return null;

  // Double the list for seamless loop
  const items = [...contributors, ...contributors];

  return (
    <div className="border-t border-border bg-card/80 overflow-hidden py-1.5">
      <div className="flex items-center gap-6 animate-ticker whitespace-nowrap">
        {items.map((c, i) => (
          <a
            key={i}
            href={`https://github.com/${c.handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            {c.handle}
          </a>
        ))}
      </div>
    </div>
  );
}
