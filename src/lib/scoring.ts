import type {
  ActionItem,
  BusinessProfile,
  CategoryBreakdown,
  HealthReport,
  InsightCard,
  ScoreBand,
  WarningMessage,
} from "@/lib/types";

const FOOD_AND_BEVERAGE_KEYWORDS = [
  "restaurant",
  "cafe",
  "coffee",
  "bar",
  "bakery",
  "bistro",
  "diner",
  "food",
  "pho",
  "pizza",
  "tea",
];

function getStatus(percent: number): "good" | "ok" | "bad" {
  if (percent >= 70) return "good";
  if (percent >= 40) return "ok";
  return "bad";
}

function isFoodAndBeverage(category: string) {
  const normalized = category.toLowerCase();
  return FOOD_AND_BEVERAGE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function scoreStarRating(rating: number) {
  if (rating >= 4.8) return 15;
  if (rating >= 4.5) return 12;
  if (rating >= 4.0) return 8;
  if (rating >= 3.5) return 4;
  return 0;
}

function scoreReviewCount(reviewCount: number) {
  if (reviewCount >= 200) return 10;
  if (reviewCount >= 100) return 8;
  if (reviewCount >= 50) return 5;
  if (reviewCount >= 20) return 3;
  return 0;
}

function scoreReviewFreshness(days: number) {
  if (days <= 7) return 10;
  if (days <= 30) return 8;
  if (days <= 90) return 5;
  if (days <= 180) return 2;
  return 0;
}

function scoreRank(rank: number | null) {
  if (rank === 1) return 25;
  if (rank === 2) return 20;
  if (rank === 3) return 15;
  if (rank === 4) return 10;
  if (rank === 5) return 5;
  return 0;
}

function scoreDescription(description?: string) {
  const length = description?.trim().length ?? 0;
  if (length >= 150) return 5;
  if (length > 0) return 2;
  return 0;
}

function scorePostCount(postsLast90Days: number) {
  if (postsLast90Days >= 4) return 10;
  if (postsLast90Days >= 2) return 7;
  if (postsLast90Days >= 1) return 4;
  return 0;
}

function scorePostFreshness(lastPostDays: number) {
  if (lastPostDays <= 14) return 10;
  if (lastPostDays <= 30) return 7;
  if (lastPostDays <= 90) return 4;
  return 0;
}

function getBand(score: number): { grade: ScoreBand; label: string; color: string } {
  if (score >= 85) return { grade: "A", label: "Excellent", color: "#059669" };
  if (score >= 70) return { grade: "B", label: "Good", color: "#D97706" };
  if (score >= 50) return { grade: "C", label: "Needs Work", color: "#EA580C" };
  return { grade: "D", label: "Critical", color: "#DC2626" };
}

function buildBreakdown(profile: BusinessProfile): CategoryBreakdown[] {
  const isFoodBusiness = isFoodAndBeverage(profile.category);
  const reviews: CategoryBreakdown = {
    id: "reviews",
    title: "Reviews & Reputation",
    icon: "Star",
    score:
      scoreStarRating(profile.rating) +
      scoreReviewCount(profile.reviewCount) +
      scoreReviewFreshness(profile.recentReviewDays),
    maxScore: 35,
    summary: "Ratings, review volume, and review freshness shape first impressions.",
    subcriteria: [
      {
        id: "star-rating",
        label: "Star rating",
        score: scoreStarRating(profile.rating),
        maxScore: 15,
        value: `${profile.rating.toFixed(1)} stars`,
        tip: "4.5+ stars is the benchmark customers trust.",
      },
      {
        id: "review-count",
        label: "Review count",
        score: scoreReviewCount(profile.reviewCount),
        maxScore: 10,
        value: `${profile.reviewCount} reviews`,
        tip: "100+ reviews builds credibility. Actively ask customers to leave reviews.",
      },
      {
        id: "review-freshness",
        label: "Review freshness",
        score: scoreReviewFreshness(profile.recentReviewDays),
        maxScore: 10,
        value: `Last review ${profile.recentReviewDays} days ago`,
        tip: "A recent review in the last 7 days signals an active, trustworthy business.",
      },
    ],
    percent: 0,
    status: "good",
  };
  reviews.percent = Math.round((reviews.score / reviews.maxScore) * 100);
  reviews.status = getStatus(reviews.percent);

  const visibility: CategoryBreakdown = {
    id: "visibility",
    title: "Search Visibility",
    icon: "TrendUp",
    score: scoreRank(profile.rankWithin1km),
    maxScore: 25,
    summary: "Visibility within 1km is a proxy for how often customers discover you first.",
    subcriteria: [
      {
        id: "search-rank",
        label: "Google Maps rank",
        score: scoreRank(profile.rankWithin1km),
        maxScore: 25,
        value:
          profile.rankWithin1km === null
            ? "Not in top 5"
            : `Rank #${profile.rankWithin1km} within 1km`,
        tip: "Being in the top 3 results captures most clicks. Reviews, completeness, and activity all affect rank.",
      },
    ],
    percent: 0,
    status: "good",
  };
  visibility.percent = Math.round((visibility.score / visibility.maxScore) * 100);
  visibility.status = getStatus(visibility.percent);

  const completeness: CategoryBreakdown = {
    id: "completeness",
    title: "Profile Completeness",
    icon: "CheckSquareOffset",
    score:
      (profile.phone ? 5 : 0) +
      (profile.website ? 5 : 0) +
      (profile.menuUrl ? 5 : isFoodBusiness ? 0 : 5) +
      scoreDescription(profile.description),
    maxScore: 20,
    summary: "Basic profile fields directly affect trust and conversion.",
    subcriteria: [
      {
        id: "phone",
        label: "Phone number",
        score: profile.phone ? 5 : 0,
        maxScore: 5,
        value: profile.phone ? "Present" : "Missing",
        tip: "A complete profile gets more clicks than an incomplete one.",
      },
      {
        id: "website",
        label: "Website URL",
        score: profile.website ? 5 : 0,
        maxScore: 5,
        value: profile.website ? "Present" : "Missing",
        tip: "A website link gives customers a fast next step.",
      },
      {
        id: "menu",
        label: isFoodAndBeverage(profile.category) ? "Menu link" : "Services link",
        score: profile.menuUrl ? 5 : isFoodAndBeverage(profile.category) ? 0 : 5,
        maxScore: 5,
        value: profile.menuUrl ? "Present" : isFoodAndBeverage(profile.category) ? "Missing" : "Not required",
        tip: isFoodAndBeverage(profile.category)
          ? "Add a menu link so customers can decide before they visit."
          : "A services link helps customers understand your offer before they contact you.",
      },
      {
        id: "description",
        label: "Business description",
        score: scoreDescription(profile.description),
        maxScore: 5,
        value:
          profile.description?.trim().length
            ? `${profile.description.trim().length} characters`
            : "Missing",
        tip: "Your description should include top services and what makes you different.",
      },
    ],
    percent: 0,
    status: "good",
  };
  completeness.percent = Math.round((completeness.score / completeness.maxScore) * 100);
  completeness.status = getStatus(completeness.percent);

  const posts: CategoryBreakdown = {
    id: "posts",
    title: "Content & Posts",
    icon: "MegaphoneSimple",
    score: scorePostCount(profile.postsLast90Days) + scorePostFreshness(profile.lastPostDays),
    maxScore: 20,
    summary: "Recent posts tell Google and customers that the business is active.",
    subcriteria: [
      {
        id: "post-count",
        label: "Posts in last 90 days",
        score: scorePostCount(profile.postsLast90Days),
        maxScore: 10,
        value: `${profile.postsLast90Days} posts`,
        tip: "Businesses that post weekly appear more active to Google's algorithm.",
      },
      {
        id: "post-freshness",
        label: "Post freshness",
        score: scorePostFreshness(profile.lastPostDays),
        maxScore: 10,
        value: `Last post ${profile.lastPostDays} days ago`,
        tip: "Share offers, events, or updates at least once every 2 weeks.",
      },
    ],
    percent: 0,
    status: "good",
  };
  posts.percent = Math.round((posts.score / posts.maxScore) * 100);
  posts.status = getStatus(posts.percent);

  return [completeness, reviews, visibility, posts];
}

function buildWarnings(profile: BusinessProfile): WarningMessage[] {
  const warnings: WarningMessage[] = [];

  if (profile.reviewCount < 100) {
    warnings.push({
      type: "warning",
      message: `Limited data: this analysis is based on ${profile.reviewCount} reviews. Results may not be fully representative.`,
    });
  }

  if (profile.postsLast90Days === 0) {
    warnings.push({
      type: "error",
      message:
        "You have not posted on Google Business Profile in 90 days. Businesses that post regularly rank higher in search results.",
      ctaLabel: "Post Now",
      ctaHref: "https://business.google.com",
    });
  }

  if (profile.competitors.filter((competitor) => !competitor.isCurrent).length === 0) {
    warnings.push({
      type: "info",
      message: `There are no other ${profile.category} businesses within 1km. Make sure your profile is complete so customers can find you easily.`,
    });
  }

  return warnings;
}

function buildInsights(profile: BusinessProfile, breakdown: CategoryBreakdown[]): InsightCard[] {
  const strongestTheme = profile.reviewThemes.find((theme) => theme.sentiment === "positive");
  const lowestCriterion = breakdown
    .flatMap((category) =>
      category.subcriteria.map((criterion) => ({
        ...criterion,
        categoryId: category.id,
        deficit: criterion.maxScore - criterion.score,
      })),
    )
    .sort((a, b) => b.deficit - a.deficit)[0];

  const quickWinField = [
    !profile.phone
      ? {
      title: "Add your phone number.",
      body: "It takes a minute and gives customers an immediate way to contact you.",
        }
      : null,
    !profile.website
      ? {
      title: "Add your website link.",
      body: "A website link creates a stronger conversion path from Maps to booking or ordering.",
        }
      : null,
    !profile.menuUrl
      ? {
      title: "Add your menu link.",
      body: "It helps customers decide before they visit and is one of the fastest profile fixes.",
        }
      : null,
    !profile.description?.trim()
      ? {
      title: "Write a business description.",
      body: "Use it to explain your top services and what makes you different.",
        }
      : null,
  ].find((value): value is { title: string; body: string } => value !== null);

  return [
    {
      id: "working",
      kind: "working",
      icon: "\u2713",
      title: strongestTheme
        ? `Customers respond well to your ${strongestTheme.theme.toLowerCase()}.`
        : "Your rating is creating trust.",
      body: strongestTheme?.summary ?? "Your reviews and visibility signals are your current strengths.",
      target: "review-themes",
    },
    {
      id: "issue",
      kind: "issue",
      icon: "!",
      title:
        lowestCriterion?.id === "post-freshness"
          ? `You have not posted in ${profile.lastPostDays} days.`
          : `Your biggest gap is ${lowestCriterion?.label.toLowerCase() ?? "profile activity"}.`,
      body:
        lowestCriterion?.id === "post-freshness"
          ? "Weekly posts improve your Google rank. Publish an update today."
          : lowestCriterion?.tip ?? "Fix the lowest-scoring input first to lift the overall score fastest.",
      target:
        lowestCriterion?.categoryId === "posts"
          ? "posts"
          : lowestCriterion?.categoryId === "completeness"
            ? "completeness"
            : lowestCriterion?.categoryId === "visibility"
              ? "visibility"
              : "reviews",
    },
    {
      id: "quick-win",
      kind: "quickWin",
      icon: "\u26A1",
      title: quickWinField?.title ?? "Ask for more recent reviews.",
      body:
        quickWinField?.body ??
        "A fresh review in the last 7 days sends a strong trust signal to Google and customers.",
      target: quickWinField ? "completeness" : "reviews",
    },
  ];
}

function buildActions(profile: BusinessProfile): ActionItem[] {
  const actions: ActionItem[] = [];
  const isFoodBusiness = isFoodAndBeverage(profile.category);

  if (profile.lastPostDays > 14) {
    actions.push({
      id: "post-update",
      icon: "Megaphone",
      title: "Post an update on Google",
      reason: `You have not posted in ${profile.lastPostDays} days. Posting every 2 weeks helps maintain rank signals.`,
      href: "https://business.google.com",
    });
  }

  if (isFoodBusiness && !profile.menuUrl) {
    actions.push({
      id: "add-menu",
      icon: "Link",
      title: "Add your menu link",
      reason: "This is one of the easiest completeness wins for food and beverage listings and helps customers convert faster.",
      href: "https://business.google.com",
    });
  }

  if (profile.reviewCount < 100) {
    actions.push({
      id: "get-reviews",
      icon: "ChatCircleDots",
      title: "Reach 100 reviews",
      reason: `You are currently at ${profile.reviewCount}. Reaching 100+ improves credibility and benchmark competitiveness.`,
    });
  }

  if (profile.recentReviewDays > 7) {
    actions.push({
      id: "fresh-review",
      icon: "Star",
      title: "Prompt recent customers for reviews",
      reason: "A review in the last 7 days is a strong freshness signal.",
    });
  }

  if ((profile.description?.trim().length ?? 0) < 150) {
    actions.push({
      id: "improve-description",
      icon: "NotePencil",
      title: "Expand your business description",
      reason: "Describe your top services and differentiators so customers understand why to choose you.",
      href: "https://business.google.com",
    });
  }

  return actions.slice(0, 5);
}

export function generateHealthReport(
  profile: BusinessProfile,
  generatedFrom: "demo" | "live",
  scannedAt: string,
): HealthReport {
  const breakdown = buildBreakdown(profile);
  const score = breakdown.reduce((total, category) => total + category.score, 0);
  const band = getBand(score);

  return {
    business: profile,
    score,
    grade: band.grade,
    label: band.label,
    color: band.color,
    summary: profile.summary,
    insightCards: buildInsights(profile, breakdown),
    breakdown,
    actions: buildActions(profile),
    warnings: buildWarnings(profile),
    generatedFrom,
    liveDataSummary:
      generatedFrom === "live"
        ? "Google data is live. Review, post, and image coverage depends on the connected sources that resolved for this scan."
        : "Running on seeded demo data because live APIs are not fully available for this scan.",
    scannedAt,
  };
}
