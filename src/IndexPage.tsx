import type { JapanesePostMeta } from "./content/japanese/posts";

interface Props {
  posts: JapanesePostMeta[];
  onSelect: (id: string) => void;
}

export default function IndexPage({ posts, onSelect }: Props) {
  return (
    <div className="dot-grid min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-12">

        {/* Site header */}
        <header className="mb-6">
          <div className="section-label mb-5">
            <span>SAKHALTEAM</span>
            <span>日本語</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            日本語の記事
          </h1>
          <p className="mt-3" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            Reading practice. Click an article to begin.
          </p>
        </header>

        {/* Section label */}
        <div className="section-label mb-0">
          <span>ARTICLES</span>
          <span>[ {posts.length} ]</span>
        </div>

        {/* Article cards */}
        <div className="grid gap-px" style={{ background: "var(--border)" }}>
          {posts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onSelect(post.id)}
              className="group w-full text-left py-5 px-1 transition-colors duration-150"
              style={{ background: "var(--bg)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elev)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                  {/* Index number */}
                  <span className="text-xs font-mono mb-1.5 block" style={{ color: "var(--muted)" }}>
                    [ {String(i + 1).padStart(2, "0")} ]
                  </span>

                  {/* Japanese title */}
                  <h2 className="text-xl font-semibold leading-snug mb-1 transition-colors" style={{ color: "var(--text)" }}>
                    {post.title}
                  </h2>

                  {/* Subtitle */}
                  {post.subtitle && (
                    <p className="text-sm mb-2.5" style={{ color: "var(--muted-bright)" }}>
                      {post.subtitle}
                    </p>
                  )}

                  {/* Tags + date */}
                  <div className="flex flex-wrap items-center gap-2">
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
                </div>

                {/* Arrow */}
                <span
                  className="text-sm font-mono mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--accent)" }}
                >
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
