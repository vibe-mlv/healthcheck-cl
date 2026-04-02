import type { BusinessProfile, SearchResult } from "@/lib/types";

const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export const demoProfiles: BusinessProfile[] = [
  {
    placeId: "demo-bangkok-brew",
    name: "Bangkok Brew House",
    address: "88 Sukhumvit Soi 24, Khlong Toei, Bangkok 10110",
    category: "Cafe",
    rating: 4.6,
    reviewCount: 87,
    recentReviewDays: 3,
    phone: "+66 2 555 0188",
    website: "https://example.com/bangkok-brew",
    menuUrl: "",
    description:
      "Specialty coffee bar serving single-origin espresso, brunch plates, and house-roasted beans in central Bangkok.",
    postsLast90Days: 1,
    lastPostDays: 47,
    rankWithin1km: 3,
    latitude: 13.7242,
    longitude: 100.5677,
    images: [
      image("photo-1495474472287-4d71bcdd2085"),
      image("photo-1509042239860-f550ce710b93"),
      image("photo-1511920170033-f8396924c348"),
      image("photo-1447933601403-0c6688de566e"),
    ],
    reviewsSampleCount: 87,
    posts: [
      {
        content:
          "Weekend special: buy one iced latte and get 20% off your second drink until Sunday.",
        publishedAt: "2026-02-14T10:00:00.000Z",
        url: "https://business.google.com",
      },
    ],
    summary:
      "Your profile is performing well, but low posting activity and a missing menu link are limiting visibility.",
    reviewThemes: [
      {
        theme: "People",
        sentiment: "positive",
        summary: "Customers consistently praise your staff's friendliness and speed.",
        reviews: [
          {
            author: "Mai Anh",
            text: "The team was welcoming and very quick even during the lunch rush.",
            publishedAt: "2026-03-29T08:10:00.000Z",
            url: "https://maps.google.com",
            rating: 5,
            themes: ["People", "Process"],
          },
          {
            author: "Tuan Le",
            text: "Staff remembered my order and made the whole visit feel personal.",
            publishedAt: "2026-03-27T09:30:00.000Z",
            url: "https://maps.google.com",
            rating: 5,
            themes: ["People"],
          },
        ],
      },
      {
        theme: "Product",
        sentiment: "positive",
        summary: "Coffee quality is a clear strength, especially espresso drinks.",
        reviews: [
          {
            author: "Nhi Tran",
            text: "The flat white was balanced and the beans tasted freshly roasted.",
            publishedAt: "2026-03-25T07:20:00.000Z",
            url: "https://maps.google.com",
            rating: 5,
            themes: ["Product"],
          },
        ],
      },
      {
        theme: "Price",
        sentiment: "neutral",
        summary: "Some customers see you as premium-priced, but acceptable for the area.",
        reviews: [],
      },
      {
        theme: "Place",
        sentiment: "positive",
        summary: "The space feels polished and comfortable for meetings.",
        reviews: [],
      },
      {
        theme: "Promotion",
        sentiment: "negative",
        summary: "Customers rarely mention current offers or new updates.",
        reviews: [],
      },
      {
        theme: "Process",
        sentiment: "neutral",
        summary: "Peak-hour ordering can slow down slightly on weekends.",
        reviews: [],
      },
    ],
    competitors: [],
  },
  {
    placeId: "demo-riverside-roasters",
    name: "Riverside Roasters",
    address: "12 Charoen Nakhon Rd, Khlong San, Bangkok 10600",
    category: "Cafe",
    rating: 4.8,
    reviewCount: 312,
    recentReviewDays: 1,
    phone: "+66 2 555 0162",
    website: "https://example.com/riverside-roasters",
    menuUrl: "https://example.com/riverside-roasters/menu",
    description:
      "Riverside specialty cafe with signature brews, seasonal pastries, and fast takeaway service.",
    postsLast90Days: 6,
    lastPostDays: 4,
    rankWithin1km: 1,
    latitude: 13.7301,
    longitude: 100.5108,
    images: [image("photo-1461023058943-07fcbe16d735")],
    reviewsSampleCount: 100,
    posts: [],
    summary:
      "Strong visibility, strong review momentum, and a complete profile make this a benchmark competitor.",
    reviewThemes: [],
    competitors: [],
  },
  {
    placeId: "demo-metro-grind",
    name: "Metro Grind Cafe",
    address: "55 Wireless Rd, Lumphini, Bangkok 10330",
    category: "Cafe",
    rating: 4.7,
    reviewCount: 164,
    recentReviewDays: 8,
    phone: "+66 2 555 0147",
    website: "https://example.com/metro-grind",
    menuUrl: "https://example.com/metro-grind/menu",
    description:
      "Modern cafe serving coffee, breakfast bowls, and weekday lunch specials.",
    postsLast90Days: 4,
    lastPostDays: 13,
    rankWithin1km: 2,
    latitude: 13.7421,
    longitude: 100.5494,
    images: [image("photo-1453614512568-c4024d13c247")],
    reviewsSampleCount: 100,
    posts: [],
    summary: "A high-performing local competitor with recent activity and strong review volume.",
    reviewThemes: [],
    competitors: [],
  },
  {
    placeId: "demo-siam-social",
    name: "Siam Social Cafe",
    address: "101 Rama I Rd, Pathum Wan, Bangkok 10330",
    category: "Cafe",
    rating: 4.5,
    reviewCount: 143,
    recentReviewDays: 18,
    phone: "+66 2 555 0121",
    website: "https://example.com/siam-social",
    menuUrl: "",
    description:
      "Casual all-day cafe with coffee, cakes, and grab-and-go meals near Siam.",
    postsLast90Days: 2,
    lastPostDays: 21,
    rankWithin1km: 4,
    latitude: 13.7465,
    longitude: 100.533,
    images: [image("photo-1501339847302-ac426a4a7cbb")],
    reviewsSampleCount: 100,
    posts: [],
    summary: "Solid ratings with moderate content activity and room to improve completeness.",
    reviewThemes: [],
    competitors: [],
  },
  {
    placeId: "demo-city-cup",
    name: "City Cup Coffee",
    address: "29 Silom Rd, Bang Rak, Bangkok 10500",
    category: "Cafe",
    rating: 4.3,
    reviewCount: 58,
    recentReviewDays: 41,
    website: "https://example.com/city-cup",
    description:
      "Neighborhood coffee stop with breakfast sandwiches and quick weekday service.",
    postsLast90Days: 0,
    lastPostDays: 120,
    rankWithin1km: 5,
    latitude: 13.7287,
    longitude: 100.5241,
    images: [image("photo-1481833761820-0509d3217039")],
    reviewsSampleCount: 58,
    posts: [],
    summary: "Lower activity and weaker review freshness are reducing this profile's competitiveness.",
    reviewThemes: [],
    competitors: [],
  },
];

export const demoSearchResults: SearchResult[] = demoProfiles.map((profile) => ({
  placeId: profile.placeId,
  name: profile.name,
  address: profile.address,
  category: profile.category,
  rating: profile.rating,
  reviewCount: profile.reviewCount,
  images: profile.images,
}));

export function getDemoProfile(placeId: string): BusinessProfile | undefined {
  const found = demoProfiles.find((profile) => profile.placeId === placeId);
  if (!found) {
    return undefined;
  }

  const sameCategory = demoProfiles
    .filter((profile) => profile.category === found.category)
    .sort((a, b) => (a.rankWithin1km ?? 999) - (b.rankWithin1km ?? 999))
    .slice(0, 5)
    .map((profile) => ({
      placeId: profile.placeId,
      name: profile.name,
      address: profile.address,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      rank: profile.rankWithin1km ?? 0,
      latitude: profile.latitude,
      longitude: profile.longitude,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        profile.name,
      )}&query_place_id=${profile.placeId}`,
      category: profile.category,
      imageUrl: profile.images[0],
      images: profile.images,
      isCurrent: profile.placeId === found.placeId,
    }));

  return {
    ...found,
    competitors: sameCategory,
  };
}
