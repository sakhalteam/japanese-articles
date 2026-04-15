// src/content/japanese/posts.ts

export type JapanesePostMeta = {
  id: string; // used in URL + lookup
  file: string; // filename in /src/content/japanese/
  title: string;
  subtitle?: string;
  date?: string; // "YYYY-MM-DD"
  tags?: string[];
};

export const japanesePosts: JapanesePostMeta[] = [
  {
    id: "bird-linguistics",
    file: "bird-linguistics.md",
    title: "鈴木先生と「ことば」を話す鳥たち",
    subtitle: "シジュウカラのふしぎな世界",
    date: "2025-11-28",
    tags: ["シジュウカラ", "動物言語学"],
  },
  {
    id: "cafe-baby",
    file: "cafe-baby.md",
    title: "夜の街とカフェと赤ちゃん",
    subtitle: "「1人で産むけど、1人じゃない」咲さんの物語",
    date: "2025-12-01",
    tags: ["仕事", "子育て", "社会"],
  },
  {
    id: "mountain-village-life",
    file: "mountain-village-life.md",
    title: "山の村で暮らすふたり",
    subtitle: "Mountain Village Life",
    date: "2025-12-21",
    tags: ["暮らし", "福祉"],
  },
  {
    id: "zelda-miyamoto",
    file: "zelda-miyamoto.md",
    title: "任天堂と「ゼルダ」を作る人",
    subtitle: "Creating Zelda at Nintendo",
    date: "2025-12-21",
    tags: ["任天堂", "ゲーム制作", "ゼルダ"],
  },
  {
    id: "adhd-01",
    file: "adhd_01.md",
    title: "ADHDと「やればできる」のウソとホント",
    subtitle: "5歳の誕生日パーティーで見えた、ADHDの頭の中",
    date: "2026-03-11",
    tags: ["ADHD", "脳科学", "日常生活"],
  },
  {
    id: "sperm-whale-vowels",
    file: "sperm-whale-vowels.md",
    title: "マッコウクジラは「母音」のような音を使う？",
    subtitle: "人間のことばに少し似た、海のクリック通信",
    date: "2026-04-14",
    tags: ["マッコウクジラ", "動物言語学", "音声学"],
  },
];
