export type ScoreBand = "A" | "B" | "C" | "D";

export type Sentiment = "positive" | "neutral" | "negative";

export type ThemeName =
  | "Product"
  | "Price"
  | "Place"
  | "Promotion"
  | "People"
  | "Process";

export type ReviewSnippet = {
  author?: string;
  avatarUrl?: string;
  text: string;
  publishedAt?: string;
  url?: string;
  rating?: number;
  themes?: ThemeName[];
};

export type PostSnippet = {
  content: string;
  publishedAt?: string;
  url?: string;
};

export type CriterionBreakdown = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  value: string;
  tip: string;
  action?: string;
};

export type CategoryBreakdown = {
  id: string;
  title: string;
  icon: string;
  score: number;
  maxScore: number;
  percent: number;
  status: "good" | "ok" | "bad";
  summary: string;
  subcriteria: CriterionBreakdown[];
};

export type ThemeInsight = {
  theme: ThemeName;
  sentiment: Sentiment;
  summary: string;
  reviews: ReviewSnippet[];
};

export type Competitor = {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  rank: number;
  latitude: number;
  longitude: number;
  mapUrl: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  isCurrent?: boolean;
};

export type ActionItem = {
  id: string;
  icon: string;
  title: string;
  reason: string;
  href?: string;
};

export type InsightCard = {
  id: string;
  kind: "working" | "issue" | "quickWin";
  icon: string;
  title: string;
  body: string;
  target: string;
};

export type WarningMessage = {
  type: "warning" | "error" | "info";
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type BusinessProfile = {
  placeId: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  reviewCount: number;
  recentReviewDays: number;
  phone?: string;
  website?: string;
  menuUrl?: string;
  description?: string;
  postsLast90Days: number;
  lastPostDays: number;
  rankWithin1km: number | null;
  latitude: number;
  longitude: number;
  images: string[];
  reviewsSampleCount: number;
  posts: PostSnippet[];
  summary: string;
  reviewThemes: ThemeInsight[];
  competitors: Competitor[];
};

export type SearchResult = {
  placeId: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
};

export type HealthReport = {
  business: BusinessProfile;
  score: number;
  grade: ScoreBand;
  label: string;
  color: string;
  summary: string;
  insightCards: InsightCard[];
  breakdown: CategoryBreakdown[];
  actions: ActionItem[];
  warnings: WarningMessage[];
  generatedFrom: "demo" | "live";
  liveDataSummary: string;
  scannedAt: string;
};
