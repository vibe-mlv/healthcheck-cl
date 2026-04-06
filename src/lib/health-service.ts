import { demoSearchResults, getDemoProfile } from "@/lib/demo-data";
import { generateHealthReport } from "@/lib/scoring";
import type {
  BusinessProfile,
  CriterionBreakdown,
  HealthReport,
  PostSnippet,
  ReviewSnippet,
  SearchResult,
  ThemeInsight,
  ThemeName,
} from "@/lib/types";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PUBLIC_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_REVIEWS_ACTOR_ID = process.env.APIFY_REVIEWS_ACTOR_ID;
const APIFY_MAPS_ACTOR_ID = process.env.APIFY_MAPS_ACTOR_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const COMPETITOR_RANK_PREFERENCE = "POPULARITY";
const APIFY_TIMEOUT_MS = 30000;
const GEMINI_TIMEOUT_MS = 20000;
const VIETNAM_LOCATION_RESTRICTION = {
  rectangle: {
    low: {
      latitude: 8.18,
      longitude: 102.14,
    },
    high: {
      latitude: 23.4,
      longitude: 109.47,
    },
  },
};

type GoogleAutocompletePrediction = {
  placeId: string;
  text?: { text?: string };
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
  types?: string[];
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: GoogleAutocompletePrediction;
  }>;
};

type PlaceDetails = {
  displayName?: { text?: string };
  formattedAddress?: string;
  primaryTypeDisplayName?: { text?: string };
  photos?: Array<{
    name?: string;
  }>;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type NearbyPlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  primaryTypeDisplayName?: { text?: string };
  photos?: Array<{ name?: string }>;
};

type NearbyResponse = {
  places?: NearbyPlace[];
};

type ApifyReview = {
  name?: string;
  reviewerPhotoUrl?: string;
  reviewerImageUrl?: string;
  profilePicture?: string;
  userImage?: string;
  text?: string;
  reviewText?: string;
  publishedAtDate?: string;
  publishedAt?: string;
  reviewUrl?: string;
  reviewLink?: string;
  stars?: number;
};

type ApifyPlaceImage = {
  url?: string;
  imageUrl?: string;
};

type ApifyPost = {
  date?: string;
  publishedAt?: string;
  text?: string;
  content?: string;
  url?: string;
  postUrl?: string;
  updatesFromCustomers?: {
    text?: string;
    language?: string;
    postDate?: string;
    postedBy?: {
      name?: string;
      url?: string;
      title?: string;
      totalReviews?: number;
    };
    media?: Array<{
      link?: string;
      postDate?: string;
    }>;
  };
};

type ApifyPlaceEntry = {
  images?: Array<ApifyPlaceImage | string>;
  title?: string;
  address?: string;
  categoryName?: string;
  totalScore?: number;
  reviewsCount?: number;
  phone?: string;
  website?: string;
  menu?: string;
  description?: string;
  posts?: ApifyPost[];
  reviews?: ApifyReview[];
  latestReviews?: ApifyReview[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type CriterionActionResponse = {
  actions?: Array<{
    id?: string;
    action?: string;
  }>;
};

type ThemeClassificationResponse = {
  themes?: Array<{
    theme?: ThemeName;
    sentiment?: "positive" | "neutral" | "negative";
    summary?: string;
  }>;
  reviews?: Array<{
    index?: number;
    themes?: ThemeName[];
    sentiment?: "positive" | "neutral" | "negative";
  }>;
};

type ClassifiedThemeData = {
  themes: ThemeInsight[];
  reviewThemeMap: Record<number, ThemeName[]>;
};

function isAutocompletePrediction(
  value: GoogleAutocompletePrediction | undefined,
): value is GoogleAutocompletePrediction {
  return Boolean(value?.placeId);
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

function hasLiveSearchConfig() {
  return Boolean(GOOGLE_API_KEY);
}

function hasLiveHealthConfig() {
  return Boolean(GOOGLE_API_KEY);
}

function convertRelativeDateToISO(relativeDate: string | undefined): string {
  if (!relativeDate) return new Date().toISOString();
  
  const match = relativeDate.match(/(\d+)\s+(year|month|week|day|hour|minute)s?\s+ago/i);
  if (!match) return new Date().toISOString();
  
  const [, amount, unit] = match;
  const num = parseInt(amount, 10);
  const date = new Date();
  
  switch (unit.toLowerCase()) {
    case 'year': date.setFullYear(date.getFullYear() - num); break;
    case 'month': date.setMonth(date.getMonth() - num); break;
    case 'week': date.setDate(date.getDate() - num * 7); break;
    case 'day': date.setDate(date.getDate() - num); break;
    case 'hour': date.setHours(date.getHours() - num); break;
    case 'minute': date.setMinutes(date.getMinutes() - num); break;
  }
  
  return date.toISOString();
}

export async function searchLocations(query: string): Promise<{ results: SearchResult[]; source: "demo" | "live" }> {
  if (!query.trim()) {
    return { results: [], source: "demo" };
  }

  if (!hasLiveSearchConfig()) {
    const lower = query.toLowerCase();
    return {
      results: demoSearchResults.filter(
        (result) =>
          result.name.toLowerCase().includes(lower) || result.address.toLowerCase().includes(lower),
      ),
      source: "demo",
    };
  }

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY!,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types",
    },
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ["vn"],
      locationRestriction: VIETNAM_LOCATION_RESTRICTION,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Autocomplete request failed.");
  }

  const data = (await response.json()) as GoogleAutocompleteResponse;
  const predictions = (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter(isAutocompletePrediction)
    .slice(0, 5);

  const results: SearchResult[] = await Promise.all(
    predictions.map(async (prediction) => {
      try {
        const details = await getPlaceDetails(prediction.placeId);
        return {
          placeId: prediction.placeId,
          name:
            details.displayName?.text ??
            prediction.structuredFormat?.mainText?.text ??
            prediction.text?.text ??
            "Unknown place",
          address:
            details.formattedAddress ??
            prediction.structuredFormat?.secondaryText?.text ??
            "Google Maps listing",
          category:
            details.primaryTypeDisplayName?.text ??
            prettifyCategory(prediction.types?.[0] ?? "Business"),
          rating: details.rating ?? 0,
          reviewCount: details.userRatingCount ?? 0,
          images: details.photos?.map((photo) => getPhotoUrl(photo.name)).filter(isDefined).slice(0, 6) ?? [],
        };
      } catch {
        return {
          placeId: prediction.placeId,
          name: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? "Unknown place",
          address: prediction.structuredFormat?.secondaryText?.text ?? "Google Maps listing",
          category: prettifyCategory(prediction.types?.[0] ?? "Business"),
          rating: 0,
          reviewCount: 0,
          images: [],
        };
      }
    }),
  );

  return { results, source: "live" };
}

function prettifyCategory(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  label: string,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    console.info(`[health-service] ${label} completed in ${Date.now() - startedAt}ms with status ${response.status}`);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[health-service] ${label} failed after ${Date.now() - startedAt}ms: ${message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getPlaceDetails(placeId: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY!,
      "X-Goog-FieldMask":
        "displayName,formattedAddress,primaryTypeDisplayName,photos.name,rating,userRatingCount,websiteUri,nationalPhoneNumber,location",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Place details request failed.");
  }

  return (await response.json()) as PlaceDetails;
}

function getPhotoUrl(photoName?: string) {
  if (!photoName || !GOOGLE_PUBLIC_MAPS_API_KEY) {
    return undefined;
  }
  return `https://places.googleapis.com/v1/${photoName}/media?key=${GOOGLE_PUBLIC_MAPS_API_KEY}&maxHeightPx=900&maxWidthPx=1200`;
}

async function runApifyActor(actorId: string, input: Record<string, unknown>) {
  const normalizedActorId = encodeURIComponent(actorId);
  const url = `https://api.apify.com/v2/acts/${normalizedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;
  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
    APIFY_TIMEOUT_MS,
    `Apify actor ${actorId}`,
  );

  if (!response.ok) {
    throw new Error(`Apify actor ${actorId} failed.`);
  }

  return (await response.json()) as unknown;
}

async function classifyThemes(reviews: string[]): Promise<ClassifiedThemeData> {
  if (!GEMINI_API_KEY || reviews.length === 0) {
    return {
      themes: fallbackThemes(),
      reviewThemeMap: Object.fromEntries(
        reviews.map((review, index) => [index, inferThemeNames(review)]),
      ),
    };
  }

  const prompt = `
Classify these Google review snippets into the Marketing Mix 6Ps themes: Product, Price, Place, Promotion, People, Process.
Return JSON only in this exact shape:
{"themes":[{"theme":"People","sentiment":"positive","summary":"..."}],"reviews":[{"index":1,"themes":["People","Process"],"sentiment":"positive"}]}
Rules:
- Keep up to 6 unique theme summaries total, one summary per theme.
- Each summary must describe what reviews are saying about that theme in under 18 words.
- For each review, assign 1 to 3 relevant themes only.
- Review indexes are 1-based and must match the input list exactly.

Reviews:
${reviews.map((review, index) => `${index + 1}. ${review}`).join("\n")}
`;

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
    GEMINI_TIMEOUT_MS,
    `Gemini classifyThemes (${reviews.length} reviews)`,
  );

  if (!response.ok) {
    return {
      themes: fallbackThemes(),
      reviewThemeMap: Object.fromEntries(
        reviews.map((review, index) => [index, inferThemeNames(review)]),
      ),
    };
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return {
      themes: fallbackThemes(),
      reviewThemeMap: Object.fromEntries(
        reviews.map((review, index) => [index, inferThemeNames(review)]),
      ),
    };
  }

  try {
    const parsed = JSON.parse(text) as ThemeClassificationResponse;
    const parsedThemes = Array.isArray(parsed.themes) ? parsed.themes : [];
    const themeSummaries = parsedThemes.map((theme) => ({
      theme: theme.theme ?? "Product",
      sentiment: theme.sentiment ?? "neutral",
      summary: theme.summary ?? "Customers mention this theme in recent reviews.",
      reviews: [],
    }));
    const reviewThemeMap = Object.fromEntries(
      reviews.map((review, index) => {
        const mapped = parsed.reviews?.find((entry) => entry.index === index + 1)?.themes;
        return [index, Array.isArray(mapped) && mapped.length > 0 ? mapped : inferThemeNames(review)];
      }),
    );
    return {
      themes: themeSummaries.length > 0 ? themeSummaries : fallbackThemes(),
      reviewThemeMap,
    };
  } catch {
    return {
      themes: fallbackThemes(),
      reviewThemeMap: Object.fromEntries(
        reviews.map((review, index) => [index, inferThemeNames(review)]),
      ),
    };
  }
}

function fallbackCriterionActions(
  criteria: Array<CriterionBreakdown & { categoryTitle: string }>,
): Record<string, string> {
  return Object.fromEntries(
    criteria.map((criterion) => {
      const percent = Math.round((criterion.score / criterion.maxScore) * 100);
      let action = "Maintain this area and monitor it in the next scan.";
      if (criterion.id === "star-rating" && percent < 80) {
        action = "Resolve low-rating issues and ask happy customers for fresh 5-star reviews.";
      } else if (criterion.id === "review-count" && percent < 80) {
        action = "Launch a steady review request flow until you cross the next review threshold.";
      } else if (criterion.id === "review-freshness" && percent < 80) {
        action = "Prompt recent customers this week so a new review lands within 7 days.";
      } else if (criterion.id === "search-rank") {
        action = "Improve reviews, completeness, and posting cadence to move into the top 3.";
      } else if (criterion.id === "phone") {
        action = "Add a primary phone number so customers can call directly from Maps.";
      } else if (criterion.id === "website") {
        action = "Add your main website link to give customers a clear next step.";
      } else if (criterion.id === "menu") {
        action = criterion.value === "Not required"
          ? "Keep your core profile fields complete and focus on reviews and activity."
          : "Add a live menu or services link so customers can decide before visiting.";
      } else if (criterion.id === "description") {
        action = "Expand the description with top services, differentiators, and key trust signals.";
      } else if (criterion.id === "post-count") {
        action = "Create a repeating posting cadence so you publish at least every 2 weeks.";
      } else if (criterion.id === "post-freshness") {
        action = "Publish a fresh update now so Google sees recent activity on the profile.";
      }
      return [criterion.id, action];
    }),
  );
}

async function generateCriterionActions(
  criteria: Array<CriterionBreakdown & { categoryTitle: string }>,
): Promise<Record<string, string>> {
  const fallback = fallbackCriterionActions(criteria);

  if (!GEMINI_API_KEY || criteria.length === 0) {
    return fallback;
  }

  const prompt = `
You are generating one recommended action for each Google Maps health-check criterion.
Return JSON only in this exact shape:
{"actions":[{"id":"star-rating","action":"..."}]}

Rules:
- One action per input criterion id.
- Keep each action under 18 words.
- Be direct and actionable.
- Do not explain the scoring system.

Criteria:
${criteria
      .map(
        (criterion) =>
          `- id: ${criterion.id}; category: ${criterion.categoryTitle}; value: ${criterion.value}; score: ${criterion.score}/${criterion.maxScore}; tip: ${criterion.tip}`,
      )
      .join("\n")}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return fallback;
  }

  try {
    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return fallback;
    }
    const parsed = JSON.parse(text) as CriterionActionResponse;
    const mapped = Object.fromEntries(
      (parsed.actions ?? [])
        .filter((entry) => entry.id && entry.action)
        .map((entry) => [entry.id as string, entry.action as string]),
    );
    return { ...fallback, ...mapped };
  } catch {
    return fallback;
  }
}

async function attachCriterionActions(report: HealthReport): Promise<HealthReport> {
  const criteria = report.breakdown.flatMap((category) =>
    category.subcriteria.map((criterion) => ({
      ...criterion,
      categoryTitle: category.title,
    })),
  );

  const actions = await generateCriterionActions(criteria);

  return {
    ...report,
    breakdown: report.breakdown.map((category) => ({
      ...category,
      subcriteria: category.subcriteria.map((criterion) => ({
        ...criterion,
        action: actions[criterion.id],
      })),
    })),
  };
}

function fallbackThemes(): ThemeInsight[] {
  return [
    { theme: "People", sentiment: "positive", summary: "Customers repeatedly mention friendly, helpful service.", reviews: [] },
    { theme: "Product", sentiment: "positive", summary: "Core products are generally seen as high quality.", reviews: [] },
    { theme: "Price", sentiment: "neutral", summary: "Pricing feels acceptable but not especially memorable.", reviews: [] },
    { theme: "Place", sentiment: "positive", summary: "The location and atmosphere support a good first impression.", reviews: [] },
    { theme: "Promotion", sentiment: "negative", summary: "Recent offers or updates are rarely visible to customers.", reviews: [] },
    { theme: "Process", sentiment: "neutral", summary: "Service flow is mostly smooth with occasional slow periods.", reviews: [] },
  ];
}

const themeKeywords: Record<ThemeName, string[]> = {
  Product: ["coffee", "drink", "food", "menu", "taste", "quality", "espresso", "pho", "do an", "mon an", "nuoc", "ngon", "chat luong"],
  Price: ["price", "expensive", "cheap", "value", "cost", "gia", "dat", "re", "hop ly"],
  Place: ["space", "atmosphere", "clean", "location", "view", "decor", "seat", "khong gian", "sach", "dep", "vi tri"],
  Promotion: ["deal", "offer", "promo", "promotion", "discount", "campaign", "khuyen mai", "uu dai", "giam gia"],
  People: ["staff", "service", "team", "friendly", "helpful", "barista", "manager", "nhan vien", "phuc vu", "than thien", "chu dao"],
  Process: ["wait", "queue", "order", "delivery", "process", "slow", "fast", "doi", "nhanh", "lau", "dat hang", "giao hang"],
};

function inferThemeNames(text: string): ThemeName[] {
  const normalized = text.toLowerCase();
  const matches = Object.entries(themeKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([theme]) => theme as ThemeName);
  return matches.length > 0 ? matches : ["Product"];
}

function inferSentiment(text: string): "positive" | "neutral" | "negative" {
  const normalized = text.toLowerCase();
  if (["great", "friendly", "excellent", "love", "best", "good", "amazing", "tot", "rat tot", "tuyet voi", "hai long", "ngon"].some((word) => normalized.includes(word))) {
    return "positive";
  }
  if (["bad", "slow", "poor", "dirty", "expensive", "worst", "disappoint", "te", "qua lau", "that vong", "khong ngon", "dat"].some((word) => normalized.includes(word))) {
    return "negative";
  }
  return "neutral";
}

function buildThemeInsights(
  reviews: ApifyReview[],
  summaries: ThemeInsight[],
  reviewThemeMap?: Record<number, ThemeName[]>,
): ThemeInsight[] {
  const grouped = new Map<ThemeName, ReviewSnippet[]>();

  for (const [index, review] of reviews.entries()) {
    const text = review.text ?? review.reviewText;
    if (!text) continue;
    const themes = reviewThemeMap?.[index] ?? inferThemeNames(text);
    const snippet: ReviewSnippet = {
      author: review.name,
      avatarUrl:
        review.reviewerPhotoUrl ??
        review.reviewerImageUrl ??
        review.profilePicture ??
        review.userImage,
      text,
      publishedAt: review.publishedAtDate ?? review.publishedAt,
      url: review.reviewUrl ?? review.reviewLink,
      rating: review.stars,
      themes,
    };

    for (const theme of themes) {
      const existing = grouped.get(theme) ?? [];
      existing.push(snippet);
      grouped.set(theme, existing);
    }
  }

  return summaries.map((theme) => ({
    ...theme,
    sentiment:
      theme.reviews.length > 0
        ? theme.sentiment
        : inferSentiment((grouped.get(theme.theme) ?? [])[0]?.text ?? theme.summary),
    reviews: (grouped.get(theme.theme) ?? [])
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      )
      .slice(0, 5),
  }));
}

function mergeReviews(primary: ApifyReview[], secondaryEntry?: ApifyPlaceEntry): ApifyReview[] {
  const combined = [
    ...primary,
    ...(secondaryEntry?.reviews ?? []),
    ...(secondaryEntry?.latestReviews ?? []),
  ].filter((review) => Boolean(review.text ?? review.reviewText));

  const seen = new Set<string>();
  return combined.filter((review) => {
    const key = `${review.name ?? ""}|${review.publishedAtDate ?? review.publishedAt ?? ""}|${review.text ?? review.reviewText ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getNearbyCompetitors(
  latitude: number,
  longitude: number,
  category: string,
  currentPlaceId: string,
) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.photos.name",
    },
    body: JSON.stringify({
      includedTypes: [category.toLowerCase().replace(/\s+/g, "_")],
      maxResultCount: 5,
      rankPreference: COMPETITOR_RANK_PREFERENCE,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 1000,
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as NearbyResponse;
  return (data.places ?? []).map((place, index: number) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown place",
    address: place.formattedAddress ?? "Google Maps listing",
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    rank: index + 1,
    latitude: place.location?.latitude ?? latitude,
    longitude: place.location?.longitude ?? longitude,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.displayName?.text ?? "Google Maps listing",
    )}&query_place_id=${place.id}`,
    category: place.primaryTypeDisplayName?.text ?? category,
    imageUrl: getPhotoUrl(place.photos?.[0]?.name),
    images: (place.photos ?? [])
      .map((photo) => getPhotoUrl(photo.name))
      .filter(isDefined)
      .slice(0, 8),
    isCurrent: place.id === currentPlaceId,
  }));
}

function adaptLiveProfile(
  placeId: string,
  category: string | undefined,
  placeDetails: PlaceDetails,
  mapsData: ApifyPlaceEntry[],
  reviewItems: ApifyReview[],
  themes: ThemeInsight[],
  competitors: Awaited<ReturnType<typeof getNearbyCompetitors>>,
  scannedAt: Date,
  reviewThemeMap?: Record<number, ThemeName[]>,
): BusinessProfile {
  const entry = mapsData?.[0] ?? {};
  const apifyImages = (entry.images ?? [])
    .map((item) => (typeof item === "string" ? item : item.url ?? item.imageUrl))
    .filter(Boolean)
    .slice(0, 10) as string[];
  const googleImages = (placeDetails.photos ?? [])
    .map((photo) => getPhotoUrl(photo.name))
    .filter(isDefined)
    .slice(0, 10);
  const images = (apifyImages.length > 0 ? apifyImages : googleImages).slice(0, 10);
  const reviews = mergeReviews(reviewItems ?? [], entry);
  const reviewAges = reviews
    .map((review) => review.publishedAtDate ?? review.publishedAt)
    .filter(isDefined)
    .map((value: string) => Math.floor((scannedAt.getTime() - new Date(value).getTime()) / 86400000));
  const newestReviewDays = reviewAges.length ? Math.max(0, Math.min(...reviewAges)) : 999;
  const postAges = (entry.posts ?? [])
    .map((post) => convertRelativeDateToISO(post.updatesFromCustomers?.postDate))
    .filter(isDefined)
    .map((value: string) => Math.floor((scannedAt.getTime() - new Date(value).getTime()) / 86400000));
  const competitorIndex = competitors.findIndex(
    (competitor: Awaited<ReturnType<typeof getNearbyCompetitors>>[number]) =>
      competitor.placeId === placeId,
  );
  console.log("Returned Post:", postAges)
  return {
    placeId,
    name: placeDetails.displayName?.text ?? entry.title ?? "Business",
    address: placeDetails.formattedAddress ?? entry.address ?? "Google Maps listing",
    category:
      category ??
      placeDetails.primaryTypeDisplayName?.text ??
      entry.categoryName ??
      "Business",
    rating: placeDetails.rating ?? entry.totalScore ?? 0,
    reviewCount: placeDetails.userRatingCount ?? entry.reviewsCount ?? reviews.length,
    recentReviewDays: newestReviewDays,
    phone: placeDetails.nationalPhoneNumber ?? entry.phone,
    website: placeDetails.websiteUri ?? entry.website,
    menuUrl: entry.menu,
    description: entry.description,
    postsLast90Days: postAges.filter((days: number) => days <= 720).length,
    lastPostDays: postAges.length ? Math.min(...postAges) : 999,
    rankWithin1km: competitorIndex >= 0 ? competitorIndex + 1 : null,
    latitude: placeDetails.location?.latitude ?? 0,
    longitude: placeDetails.location?.longitude ?? 0,
    images,
    reviewsSampleCount: reviews.length,
    posts: (entry.posts ?? [])
      .map(
        (post): PostSnippet | null =>
          (post.text ?? post.content)
            ? {
              content: post.text ?? post.content ?? "",
              publishedAt: convertRelativeDateToISO(post.updatesFromCustomers?.postDate),
              url: post.url ?? post.postUrl ?? "https://business.google.com",
            }
            : null,
      )
      .filter(isDefined)
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      ),
    summary: "This score blends Google listing quality, freshness, and nearby competition signals.",
    reviewThemes: buildThemeInsights(reviews, themes, reviewThemeMap),
    competitors:
      competitors.length > 0
        ? competitors
        : [
          {
            placeId,
            name: placeDetails.displayName?.text ?? "Business",
            address: placeDetails.formattedAddress ?? "Google Maps listing",
            rating: placeDetails.rating ?? 0,
            reviewCount: placeDetails.userRatingCount ?? reviews.length,
            rank: 1,
            latitude: placeDetails.location?.latitude ?? 0,
            longitude: placeDetails.location?.longitude ?? 0,
            mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.displayName?.text ?? "Business")}&query_place_id=${placeId}`,
            category: category ?? "Business",
            imageUrl: images[0],
            images,
            isCurrent: true,
          },
        ],
  };
}

export async function getHealthReport(placeId: string, category?: string): Promise<HealthReport> {
  const scannedAt = new Date();

  if (!hasLiveHealthConfig()) {
    const demoProfile = getDemoProfile(placeId);
    if (!demoProfile) {
      throw new Error("We could not find this location.");
    }

    return attachCriterionActions(generateHealthReport(
      {
        ...demoProfile,
        category: category ?? demoProfile.category,
      },
      "demo",
      scannedAt.toISOString(),
    ));
  }

  try {
    const placeDetails = await getPlaceDetails(placeId);
    const latitude = placeDetails.location?.latitude ?? 0;
    const longitude = placeDetails.location?.longitude ?? 0;

    const [reviewItems, mapsData, competitors] = await Promise.all([
      APIFY_API_TOKEN && APIFY_REVIEWS_ACTOR_ID
        ? runApifyActor(APIFY_REVIEWS_ACTOR_ID, {
          placeIds: [placeId],
          maxReviews: 100,
          reviewsSort: "newest",
          reviewsOrigin: "google",
          personalData: true,
        }).catch(() => [])
        : Promise.resolve([]),
      APIFY_API_TOKEN && APIFY_MAPS_ACTOR_ID
        ? runApifyActor(APIFY_MAPS_ACTOR_ID, {
          placeIds: [placeId],
          maxCrawledPlacesPerSearch: 1,
          scrapePlaceDetailPage: true,
          maxReviews: 25,
          maxImages: 10,
          scrapeReviewsPersonalData: true,
        }).catch(() => [])
        : Promise.resolve([]),
      getNearbyCompetitors(
        latitude,
        longitude,
        category ?? placeDetails.primaryTypeDisplayName?.text ?? "business",
        placeId,
      ).catch(() => []),
    ]);

    const mergedReviews = mergeReviews(
      reviewItems as ApifyReview[],
      (mapsData as ApifyPlaceEntry[])[0],
    );
    const reviewTexts = mergedReviews
      .map((review) => review.text ?? review.reviewText)
      .filter(isDefined)
      .slice(0, 100) as string[];
    const classified = await classifyThemes(reviewTexts);

    const profile = adaptLiveProfile(
      placeId,
      category,
      placeDetails,
      mapsData as ApifyPlaceEntry[],
      mergedReviews,
      classified.themes,
      competitors,
      scannedAt,
      classified.reviewThemeMap,
    );

    return attachCriterionActions(generateHealthReport(profile, "live", scannedAt.toISOString()));
  } catch {
    if (placeId.startsWith("demo-")) {
      const demoProfile = getDemoProfile(placeId) ?? getDemoProfile("demo-bangkok-brew");
      if (!demoProfile) {
        throw new Error("We could not find this location.");
      }
      return attachCriterionActions(generateHealthReport(
        {
          ...demoProfile,
          category: category ?? demoProfile.category,
        },
        "demo",
        scannedAt.toISOString(),
      ));
    }
    throw new Error("We could not fetch live data for this location.");
  }
}
