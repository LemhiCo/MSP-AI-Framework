import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

interface MarkdownModalProps {
  src: string;
  open: boolean;
  onClose: () => void;
  title?: string;
  icon?: string;
  cta?: { label: string; to?: string; href?: string };
}

export default function MarkdownModal({ src, open, onClose, title, icon, cta }: MarkdownModalProps) {
  const [html, setHtml] = useState("");
  const [extractedTitle, setExtractedTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch(src)
      .then((r) => r.text())
      .then((md) => {
        const h1Match = md.match(/^#\s+(.+)$/m);
        if (h1Match) setExtractedTitle(h1Match[1]);
        // Remove H1 from body
        let body = md.replace(/^#\s+.+\n*/m, "");
        // Extract subtitle (bold italic line like **text** or _text_)
        const subMatch = body.match(/^\*\*(.+)\*\*\s*$/m);
        if (subMatch) {
          setSubtitle(subMatch[1]);
          body = body.replace(/^\*\*(.+)\*\*\s*\n*/m, "");
        }
        const emSubMatch = body.match(/^_(.+)_\s*$/m);
        if (emSubMatch) {
          setSubtitle((prev) => prev ? `${prev} — ${emSubMatch[1]}` : emSubMatch[1]);
          body = body.replace(/^_(.+)_\s*\n*/m, "");
        }
        setHtml(renderMarkdown(body));
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
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                {icon && <span className="text-xl shrink-0">{icon}</span>}
                <h2 className="text-xl font-serif font-semibold">{displayTitle}</h2>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1.5 ml-[calc(1.25rem+0.625rem)]">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          className="overflow-y-auto flex-1 px-6 py-5 md-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-card">
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          {cta?.to && (
            <Link
              to={cta.to}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {cta.label}
            </Link>
          )}
          {cta?.href && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Converts markdown into structured HTML with styled sections.
 * Each ## heading starts a new visual "section card".
 */
function renderMarkdown(md: string): string {
  // Split into sections by ## headers
  const lines = md.split("\n");
  const sections: { heading?: string; content: string[] }[] = [];
  let current: { heading?: string; content: string[] } = { content: [] };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (current.heading || current.content.length > 0) {
        sections.push(current);
      }
      current = { heading: h2Match[1], content: [] };
    } else {
      current.content.push(line);
    }
  }
  if (current.heading || current.content.length > 0) {
    sections.push(current);
  }

  return sections
    .map((section) => {
      const body = parseBlock(section.content.join("\n").trim());
      if (!body && !section.heading) return "";

      if (!section.heading) {
        // Intro text before any ## heading
        return `<div class="md-intro">${body}</div>`;
      }

      return `<div class="md-section">
        <h2>${inlineFormat(section.heading)}</h2>
        ${body}
      </div>`;
    })
    .join("");
}

/** Parse a block of markdown lines into HTML */
function parseBlock(block: string): string {
  if (!block) return "";

  let result = block
    // --- → nothing (we use section cards instead)
    .replace(/^---$/gm, "")
    // ### sub-headings
    .replace(/^###\s+(.+)$/gm, (_, text) => `<h3>${inlineFormat(text)}</h3>`)
    // Numbered lists: "1. text" or "### 1. text"
    .replace(/^(\d+)\.\s+(.+)$/gm, (_, _n, text) => `<li class="md-ordered">${inlineFormat(text)}</li>`)
    // Unordered lists
    .replace(/^-\s+(.+)$/gm, (_, text) => `<li>${inlineFormat(text)}</li>`);

  // Wrap consecutive <li> in <ul>
  result = result.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, (m) => {
    const isOrdered = m.includes('class="md-ordered"');
    const tag = isOrdered ? "ol" : "ul";
    const cleaned = m.replace(/ class="md-ordered"/g, "");
    return `<${tag}>${cleaned.trim()}</${tag}>`;
  });

  // Wrap remaining bare text lines as <p>
  result = result
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t) return "";
      if (/^<[a-z/]/.test(t)) return t;
      return `<p>${inlineFormat(t)}</p>`;
    })
    .join("\n");

  return result.replace(/<p>\s*<\/p>/g, "");
}

/** Inline formatting: bold, italic, bold+italic */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}
