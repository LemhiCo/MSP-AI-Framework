import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

interface MarkdownModalProps {
  src: string;
  open: boolean;
  onClose: () => void;
  /** Optional title override (otherwise extracted from the md H1) */
  title?: string;
  /** Optional emoji/icon before the title */
  icon?: string;
  /** Optional CTA at the bottom */
  cta?: { label: string; to?: string; href?: string };
}

export default function MarkdownModal({ src, open, onClose, title, icon, cta }: MarkdownModalProps) {
  const [html, setHtml] = useState("");
  const [extractedTitle, setExtractedTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch(src)
      .then((r) => r.text())
      .then((md) => {
        // Extract H1 for the sticky header
        const h1Match = md.match(/^#\s+(.+)$/m);
        if (h1Match) setExtractedTitle(h1Match[1]);
        // Remove the first H1 from body (we show it in the header)
        const bodyMd = md.replace(/^#\s+.+\n*/m, "");
        setHtml(simpleMarkdown(bodyMd));
      })
      .catch(() => setHtml("<p>Failed to load content.</p>"));
  }, [src, open]);

  if (!open) return null;

  const displayTitle = title || extractedTitle;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-fade-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: "300ms" }}
      >
        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-xl shrink-0">{icon}</span>}
            <h2 className="text-lg font-serif font-semibold truncate">{displayTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div
          className="overflow-y-auto flex-1 px-6 py-5 prose prose-sm dark:prose-invert max-w-none
            prose-headings:font-serif
            prose-h2:text-lg prose-h2:mt-12 prose-h2:mb-4 prose-h2:font-semibold
            prose-h3:text-base prose-h3:mt-10 prose-h3:mb-3 prose-h3:font-semibold
            prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-foreground/80 prose-p:my-1.5
            prose-li:text-[13px] prose-li:leading-relaxed prose-li:text-foreground/80
            prose-ul:my-2 prose-ul:pl-1
            prose-strong:text-foreground prose-strong:font-semibold
            prose-em:text-muted-foreground
            prose-hr:border-border prose-hr:my-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* ── Sticky footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-card">
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          {cta && cta.to && (
            <Link
              to={cta.to}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {cta.label}
            </Link>
          )}
          {cta && cta.href && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** Minimal Markdown → HTML (no deps needed) */
function simpleMarkdown(md: string): string {
  let result = md
    // Bold + italic combos first
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Headings (must come before paragraph wrapping)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // HR
    .replace(/^---$/gm, '<hr/>')
    // List items
    .replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  result = result.replace(/((?:<li>.*<\/li>\s*)+)/g, (m) => `<ul>${m.trim()}</ul>`);

  // Wrap remaining bare lines as <p>
  result = result
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^<[a-z]/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  // Cleanup
  result = result.replace(/<p>\s*<\/p>/g, '');

  return result;
}
