import { useEffect, useState } from "react";
import ArticlePage from "./ArticlePage";
import IndexPage from "./IndexPage";
import { japanesePosts } from "./content/japanese/posts";

function getHashId() {
  const hash = window.location.hash.slice(1);
  return hash && japanesePosts.some(p => p.id === hash) ? hash : null;
}

function getInitialTheme(): "dark" | "light" {
  const saved = localStorage.getItem("ja-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function HomeBtn() {
  return (
    <a href="https://sakhalteam.github.io/" className="home-btn" title="Back to island">
      <svg width="20" height="12" viewBox="0 0 32 18" fill="currentColor" aria-hidden="true">
        <path d="M 4,10 C 5,4 9,2 14,3 C 18,4 20,2 24,4 C 28,6 29,11 26,15 C 22,18 12,18 6,15 C 2,13 2,11 4,10 Z" />
      </svg>
      sakhalteam
    </a>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ja-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <button className="theme-toggle" onClick={toggle} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? (
        // Sun icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(getHashId);

  useEffect(() => {
    const onHashChange = () => setActiveId(getHashId());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (id: string | null) => {
    window.location.hash = id ? id : "";
  };

  const activePost = activeId ? japanesePosts.find(p => p.id === activeId) ?? null : null;

  return (
    <>
      <HomeBtn />
      <ThemeToggle />
      {activePost ? (
        <ArticlePage post={activePost} onBack={() => navigate(null)} />
      ) : (
        <IndexPage posts={japanesePosts} onSelect={id => navigate(id)} />
      )}
    </>
  );
}
