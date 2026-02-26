// src/content/japanese/loadJapanesePost.ts

// Each entry is a function that returns the raw markdown string.
const mdModules = import.meta.glob<string>("./*.md", {
  query: "?raw",
  import: "default",
});

/**
 * Loads a markdown file from this folder (src/content/japanese/).
 *
 * @param file e.g. "mountain-village-life.md"
 */
export async function loadJapanesePost(file: string): Promise<string> {
  // Keys in mdModules look like "./mountain-village-life.md"
  const key = `./${file}`;
  const loader = mdModules[key];

  if (!loader) {
    // Helpful debug: show what keys exist
    const available = Object.keys(mdModules)
      .map((k) => k.replace("./", ""))
      .sort()
      .join(", ");

    throw new Error(
      `Markdown file not found: ${key}\nAvailable: ${available || "(none)"}`
    );
  }

  return await loader();
}
