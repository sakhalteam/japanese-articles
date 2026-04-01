import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { loadJapanesePost } from "./content/japanese/loadJapanesePost";
import type { JapanesePostMeta } from "./content/japanese/posts";

interface Props {
  post: JapanesePostMeta;
  onBack: () => void;
}

export default function ArticlePage({ post, onBack }: Props) {
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  // Load markdown
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setMd("");

    loadJapanesePost(post.file)
      .then(raw => { if (!cancelled) setMd(raw); })
      .catch(e => { if (!cancelled) setErr(e?.message ?? "Failed to load."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [post.file]);

  // Scroll progress
  useEffect(() => {
    function onScroll() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) { setProgress(100); return; }
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(100, (scrolled / total) * 100));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [md]);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [post.id]);

  // Tap-to-reveal furigana on touch devices
  useEffect(() => {
    if (loading || err) return;

    let dismissAll: (() => void) | null = null;

    const raf = requestAnimationFrame(() => {
      if (!window.matchMedia('(pointer: coarse)').matches) return;

      const body = articleRef.current?.querySelector('.article-body');
      if (!body) return;

      const rubies = Array.from(body.querySelectorAll('ruby'));
      dismissAll = () => rubies.forEach(r => r.classList.remove('revealed'));

      rubies.forEach(ruby => {
        ruby.addEventListener('click', e => {
          e.stopPropagation();
          const wasRevealed = ruby.classList.contains('revealed');
          dismissAll!();
          if (!wasRevealed) ruby.classList.add('revealed');
        });
      });

      window.addEventListener('scroll', dismissAll, { passive: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (dismissAll) window.removeEventListener('scroll', dismissAll);
    };
  }, [loading, err, md]);

  return (
    <div className="dot-grid min-h-screen" ref={articleRef}>

      {/* Progress bar */}
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Back nav */}
        <div className="section-label mb-10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-widest transition-colors hover:text-white"
            style={{ color: "var(--muted)" }}
          >
            ← All Articles
          </button>
          <span>JAPANESE ARTICLES</span>
        </div>

        {/* Article header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold leading-snug mb-2" style={{ color: "var(--text)" }}>
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-base mb-4" style={{ color: "var(--muted-bright)" }}>
              {post.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {post.date && (
              <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                {post.date}
              </span>
            )}
            {post.tags?.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-sm border"
                style={{ borderColor: "var(--border-accent)", color: "var(--muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Divider */}
        <div className="mb-10" style={{ borderTop: "1px solid var(--border)" }} />

        {/* Article body */}
        {loading && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
        )}
        {err && (
          <p className="text-sm" style={{ color: "#f87171" }}>Error: {err}</p>
        )}
        {!loading && !err && (
          <div className="article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {stripFrontmatter(md)}
            </ReactMarkdown>
          </div>
        )}

        {/* Bottom nav */}
        {!loading && !err && (
          <div className="mt-16 section-label">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-xs uppercase tracking-widest transition-colors hover:text-white"
              style={{ color: "var(--muted)" }}
            >
              ← Back to Articles
            </button>
            <span style={{ color: "var(--accent)" }}>■</span>
          </div>
        )}

      </div>
    </div>
  );
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return markdown;
  const after = markdown.indexOf("\n", end + 4);
  return after === -1 ? "" : markdown.slice(after + 1);
}
