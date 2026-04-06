# Code Adjustments Needed for APIFy Posts Structure

## Overview
The new APIFy response structure for posts has changed from a simple flat structure to a more detailed format with customer updates, poster metadata, and media attachments. This document outlines the required code changes to handle the new `updatesFromCustomers` field.

---

## Current Data Structure (Old)
```typescript
type ApifyPost = {
  date?: string;
  publishedAt?: string;
  text?: string;
  content?: string;
  url?: string;
  postUrl?: string;
};
```

**Current extraction logic (line 774-789 in health-service.ts):**
```typescript
posts: (entry.posts ?? [])
  .map(
    (post): PostSnippet | null =>
      (post.text ?? post.content)
        ? {
          content: post.text ?? post.content ?? "",
          publishedAt: post.date ?? post.publishedAt,
          url: post.url ?? post.postUrl ?? "https://business.google.com",
        }
        : null,
  )
  .filter(isDefined)
```

---

## New Data Structure (APIFy)
```typescript
{
  updatesFromCustomers: {
    text: string;                    // Main post content
    language: string;                // Language code (e.g., "en")
    postDate: string;                // Relative date (e.g., "a year ago")
    postedBy: {
      name: string;                  // Poster name
      url: string;                   // Profile URL
      title: string;                 // User title (e.g., "Local Guide")
      totalReviews: number;          // Number of reviews by this user
    };
    media: Array<{
      link: string;                  // Image/media URL
      postDate: string;              // When media was posted
    }>;
  }
}
```

---

## Required Code Changes

### 1. **Update `ApifyPost` Type Definition**
**File:** `src/lib/health-service.ts` (lines 108-115)

**Current:**
```typescript
type ApifyPost = {
  date?: string;
  publishedAt?: string;
  text?: string;
  content?: string;
  url?: string;
  postUrl?: string;
};
```

**Needed Adjustments:**
```typescript
type ApifyPost = {
  date?: string;
  publishedAt?: string;
  text?: string;
  content?: string;
  url?: string;
  postUrl?: string;
  // New fields for APIFy structure
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
```

**Check:** Does the API return the new `updatesFromCustomers` field alongside the old fields, or as a replacement? This affects whether both should be optional.

---

### 2. **Update `PostSnippet` Type**
**File:** `src/lib/types.ts` (lines 24-28)

**Current:**
```typescript
export type PostSnippet = {
  content: string;
  publishedAt?: string;
  url?: string;
};
```

**Needed Adjustments:**
Add optional fields to capture poster metadata:
```typescript
export type PostSnippet = {
  content: string;
  publishedAt?: string;
  url?: string;
  // New optional fields for customer update posts
  posterName?: string;           // Name of who posted
  posterTitle?: string;          // User's title (e.g., "Local Guide")
  posterReviewCount?: number;    // How many reviews this user has
  posterProfileUrl?: string;     // Link to poster's profile
  media?: Array<{ link: string }>;  // Media attachments
};
```

**Check:** Should we display poster metadata in the UI? This affects whether these fields are worth adding.

---

### 3. **Update Post Mapping Logic**
**File:** `src/lib/health-service.ts` (lines 774-789)

**Current Logic:**
```typescript
posts: (entry.posts ?? [])
  .map(
    (post): PostSnippet | null =>
      (post.text ?? post.content)
        ? {
          content: post.text ?? post.content ?? "",
          publishedAt: post.date ?? post.publishedAt,
          url: post.url ?? post.postUrl ?? "https://business.google.com",
        }
        : null,
  )
  .filter(isDefined)
  .sort((a, b) => /* sort by date */)
```

**Needed Adjustments:**
Add extraction for `updatesFromCustomers` field:
```typescript
posts: (entry.posts ?? [])
  .map((post): PostSnippet | null => {
    // Handle legacy posts
    const legacyText = post.text ?? post.content;
    const legacyDate = post.date ?? post.publishedAt;
    
    // Handle new APIFy structure
    const newText = post.updatesFromCustomers?.text;
    const newDate = post.updatesFromCustomers?.postDate;
    
    // Use whichever is available
    const text = legacyText ?? newText;
    const publishedAt = legacyDate ?? newDate;
    
    if (!text) return null;
    
    return {
      content: text,
      publishedAt,
      url: post.url ?? post.postUrl ?? post.updatesFromCustomers?.postedBy?.url ?? "https://business.google.com",
      // Optional: Include poster metadata
      posterName: post.updatesFromCustomers?.postedBy?.name,
      posterTitle: post.updatesFromCustomers?.postedBy?.title,
      posterReviewCount: post.updatesFromCustomers?.postedBy?.totalReviews,
      posterProfileUrl: post.updatesFromCustomers?.postedBy?.url,
      media: post.updatesFromCustomers?.media?.map(m => ({ link: m.link })),
    };
  })
  .filter(isDefined)
  .sort((a, b) => /* existing sort logic */)
```

**Check:** 
- Should we extract and store the media URLs?
- How should we handle date format conversion (relative dates like "a year ago" need parsing)?
- Is the `url` field the right fallback, or should we construct a Google Maps link?

---

### 4. **Date Parsing Function** (Likely needed)
**File:** `src/lib/health-service.ts`

**New Function Required:**
```typescript
function parseRelativeDate(relativeDate: string): string {
  // Convert "a year ago", "2 weeks ago", "a day ago" into ISO string or parseable date
  // This is needed because APIFy returns relative dates instead of absolute dates
  // Examples:
  // "a year ago" → 365 days before now
  // "2 weeks ago" → 14 days before now
  // "a day ago" → 1 day before now
  
  // Implementation approach:
  // 1. Parse the relative string using regex
  // 2. Calculate absolute date from current time
  // 3. Return ISO string or similar format
}
```

**Check:**
- Exact format of the `postDate` string returned by APIFy
- Whether we need exact timestamp or approximate date is sufficient

---

## Summary of Checks Needed

| Check | Impact | Priority |
|-------|--------|----------|
| Does API return both old and new post fields, or replacement? | Determines fallback strategy | 🔴 High |
| Should we display poster metadata (name, title, review count)? | Affects `PostSnippet` type expansion | 🟡 Medium |
| How to handle relative date strings ("a year ago")? | Needed for accurate date sorting and display | 🔴 High |
| Should we extract and display media attachments? | Affects UI rendering and type definitions | 🟡 Medium |
| What's the exact format of `postDate` from APIFy? | Critical for date parsing | 🔴 High |

---

## Implementation Order

1. **Add date parsing function** first (handles the relative date format)
2. **Update `ApifyPost` type** to include new fields
3. **Update `PostSnippet` type** if UI will display poster metadata
4. **Update post mapping logic** to handle both old and new structures
5. **Test edge cases** (missing fields, date formats, media arrays)

---

## Component Consideration

**File:** `src/components/health-demo-app.tsx`

Once posts are correctly mapped with new fields, check if the UI component needs updates to:
- Display poster information (optional)
- Display media thumbnails/lightbox (optional)
- Handle relative date display properly

This file will need review once the data extraction is finalized.
