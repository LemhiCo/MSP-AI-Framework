import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface MarkdownModalProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

export default function MarkdownModal({ src, open, onClose }: MarkdownModalProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch(src)
      .then((r) => r.text())
      .then((md) => setHtml(simpleMarkdown(md)))
      .catch(() => setHtml("<p>Failed to load content.</p>"));
  }, [src, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-fade-up relative"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: "300ms" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-li:text-sm prose-hr:border-border"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

/** Minimal Markdown → HTML (no deps needed) */
function simpleMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^(?!<[huplo])((?!<).+)$/gm, '<p>$1</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n{2,}/g, '\n');
}
