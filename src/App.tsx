import { useState } from "react";
import ArticlePage from "./ArticlePage";
import IndexPage from "./IndexPage";
import { japanesePosts } from "./content/japanese/posts";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePost = activeId ? japanesePosts.find(p => p.id === activeId) ?? null : null;

  if (activePost) {
    return (
      <ArticlePage
        post={activePost}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <IndexPage
      posts={japanesePosts}
      onSelect={id => setActiveId(id)}
    />
  );
}
