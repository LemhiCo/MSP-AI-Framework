import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Heart } from "lucide-react";

interface Contributor {
  handle: string;
  date: string;
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

  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-card px-4 py-1.5 flex items-center gap-3">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0">
        <Heart className="w-2.5 h-2.5 text-destructive" /> Contributors
      </span>
      <div className="flex items-center gap-3 overflow-x-auto">
        {contributors.map((c) => (
          <a
            key={c.handle}
            href={`https://github.com/${c.handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0"
            title={`Joined ${c.date}`}
          >
            {c.handle}
          </a>
        ))}
      </div>
    </div>
  );
}
