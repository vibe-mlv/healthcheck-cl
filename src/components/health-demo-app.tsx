"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  ArrowRight,
  ArrowSquareOut,
  CalendarDots,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChatCircleDots,
  ChartLineUp,
  CheckCircle,
  ClockCountdown,
  Link,
  LinkSimple,
  MapPin,
  MegaphoneSimple,
  MinusCircle,
  NotePencil,
  ShieldCheck,
  Star,
  Storefront,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import type { CategoryBreakdown, HealthReport, SearchResult, ThemeInsight } from "@/lib/types";
import ContactUsSection from "./contact-us-section";

const statusMessages = [
  "Finding your business on Google Maps...",
  "Collecting your last 100 reviews...",
  "Analyzing what customers are saying...",
  "Checking who's competing nearby...",
  "Calculating your health score...",
];

const gbpBestPractices = [
  {
    title: "Keep your profile details accurate and up to date",
    href: "https://support.google.com/business/answer/3039617?hl=en",
  },
  {
    title: "Create and manage posts regularly",
    href: "https://support.google.com/business/answer/7342169?hl=en",
  },
  {
    title: "Encourage and manage reviews properly",
    href: "https://support.google.com/business/answer/3474122?hl=en",
  },
  {
    title: "Report inappropriate reviews when needed",
    href: "https://support.google.com/business/answer/4596773?hl=en",
  },
  {
    title: "Protect your Google Business Profile from hijacking",
    href: "https://support.google.com/business/answer/14509283?hl=en",
  },
];

const mapLovinBenefits = [
  "Deeper, more actionable insights than the default GBP view.",
  "Reports customized to your category, market, and growth goals.",
  "Competitor tracking that shows who is gaining visibility nearby.",
  "Protection workflows to reduce GBP hacking and unauthorized edits.",
  "Review growth guidance that helps you generate more high-quality feedback.",
];

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function formatShortDate(value?: string) {
  if (!value) return "Recent";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recent";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(parsed);
}

function reviewerInitials(name?: string) {
  const source = (name ?? "Google reviewer").trim();
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "G";
}

function shouldShowCriterionValue(categoryId: CategoryBreakdown["id"]) {
  return categoryId === "reviews";
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const chartData = [{ name: "score", value: score, fill: color }];

  return (
    <div className="scoreGauge">
      <RadialBarChart
        width={220}
        height={220}
        innerRadius="78%"
        outerRadius="100%"
        data={chartData}
        startAngle={90}
        endAngle={-270}
        barSize={18}
      >
        <PolarGrid radialLines={false} polarAngles={[]} stroke="#dce4ef" />
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <RadialBar dataKey="value" cornerRadius={999} background={{ fill: "#dce4ef" }} />
      </RadialBarChart>
      <div className="scoreGaugeLabel">
        <strong>{score}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}

function sentimentEmoji(theme: ThemeInsight) {
  if (theme.sentiment === "positive") return ":)";
  if (theme.sentiment === "neutral") return ":|";
  return ":(";
}

function categoryIcon(category: CategoryBreakdown["id"]) {
  switch (category) {
    case "reviews":
      return <Star size={20} weight="fill" />;
    case "visibility":
      return <ChartLineUp size={20} weight="bold" />;
    case "completeness":
      return <ShieldCheck size={20} weight="bold" />;
    default:
      return <MegaphoneSimple size={20} weight="bold" />;
  }
}

function statusIcon(status: "good" | "ok" | "bad") {
  if (status === "good") {
    return <CheckCircle size={18} weight="fill" />;
  }
  if (status === "ok") {
    return <MinusCircle size={18} weight="fill" />;
  }
  return <Warning size={18} weight="fill" />;
}

function criterionStatus(score: number, maxScore: number): "good" | "ok" | "bad" {
  const percent = Math.round((score / maxScore) * 100);
  if (percent >= 70) return "good";
  if (percent >= 40) return "ok";
  return "bad";
}

function renderActionIcon(icon: string) {
  switch (icon) {
    case "Megaphone":
      return <MegaphoneSimple size={20} weight="bold" />;
    case "Link":
      return <LinkSimple size={20} weight="bold" />;
    case "ChatCircleDots":
      return <ChatCircleDots size={20} weight="bold" />;
    case "Star":
      return <Star size={20} weight="fill" />;
    case "NotePencil":
      return <NotePencil size={20} weight="bold" />;
    default:
      return <ShieldCheck size={20} weight="bold" />;
  }
}

function ProgressOverlay({ progress, elapsedMs }: { progress: number; elapsedMs: number }) {
  const isExtendedScan = elapsedMs >= 15000;
  const messageIndex = isExtendedScan
    ? statusMessages.length - 1
    : Math.min(statusMessages.length - 1, Math.floor(progress / 20));

  return (
    <div className="overlay">
      <motion.div
        className="overlayCard"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="overlayBadge">
          {isExtendedScan ? "Extended scan in progress" : "15-second check in progress"}
        </div>
        <h2>Scanning your Google Maps health</h2>
        <p>
          {isExtendedScan
            ? "The live sources are taking longer than expected. We are still processing your report."
            : statusMessages[messageIndex]}
        </p>
        <div className="progressTrack">
          <motion.div className="progressFill" animate={{ width: `${progress}%` }} />
        </div>
        <div className="overlayFooter">
          <ClockCountdown size={18} weight="bold" />
          <span>
            {isExtendedScan
              ? `Still running after ${Math.floor(elapsedMs / 1000)} seconds`
              : `${Math.max(0, Math.ceil((15000 - elapsedMs) / 1000))} seconds left`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function CompetitorMap({
  report,
  visible,
}: {
  report: HealthReport;
  visible: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const competitors = report.business.competitors;
  const latitudes = competitors.map((item) => item.latitude);
  const longitudes = competitors.map((item) => item.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

  useEffect(() => {
    if (!visible || !mapRef.current || !mapsApiKey || !mapId) {
      return;
    }

    void (async () => {
      setOptions({
        key: mapsApiKey,
        v: "weekly",
        libraries: ["marker"],
        mapIds: [mapId],
      });

      const { Map, InfoWindow } = (await importLibrary("maps")) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      const center = {
        lat: report.business.latitude,
        lng: report.business.longitude,
      };

      const map = new Map(mapRef.current as HTMLDivElement, {
        center,
        zoom: 15,
        mapId,
        disableDefaultUI: true,
        zoomControl: true,
      });

      competitors.forEach((competitor) => {
        const markerContent = document.createElement("div");
        markerContent.className = `advancedMarker ${competitor.isCurrent ? "you" : ""}`;
        markerContent.textContent = competitor.isCurrent ? "YOU" : String(competitor.rank);

        const marker = new AdvancedMarkerElement({
          map,
          position: {
            lat: competitor.latitude,
            lng: competitor.longitude,
          },
          content: markerContent,
          title: competitor.name,
        });

        const infoWindow = new InfoWindow({
          content: `<div style="padding:8px 10px;min-width:160px"><strong>${competitor.name}</strong><br/>${competitor.rating.toFixed(1)} stars \u00b7 ${competitor.reviewCount} reviews</div>`,
        });

        marker.addListener("gmp-click", () => {
          infoWindow.open({ anchor: marker, map });
        });
      });
    })();
  }, [competitors, mapId, mapsApiKey, report.business.latitude, report.business.longitude, visible]);

  if (!visible) return null;

  return (
    <div className="mapPanel">
      {mapsApiKey && mapId ? (
        <div ref={mapRef} className="googleMapCanvas" />
      ) : (
        <div className="mapFallback">
          {competitors.map((competitor) => {
            const x = ((competitor.longitude - minLng) / Math.max(maxLng - minLng, 0.001)) * 100;
            const y = ((competitor.latitude - minLat) / Math.max(maxLat - minLat, 0.001)) * 100;
            return (
              <a
                key={competitor.placeId}
                className={`mapMarker ${competitor.isCurrent ? "you" : ""}`}
                href={competitor.mapUrl}
                target="_blank"
                rel="noreferrer"
                style={{ left: `${10 + x * 0.8}%`, top: `${15 + (100 - y) * 0.65}%` }}
                aria-label={competitor.name}
              >
                {competitor.isCurrent ? "YOU" : competitor.rank}
              </a>
            );
          })}
        </div>
      )}
      <div className="mapLegend">
        <span>
          {mapsApiKey && mapId
            ? "Google Maps is active with live marker rendering."
            : "This demo renders a styled fallback map panel."}
        </span>
        {!mapsApiKey || !mapId ? (
          <span>Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAP_ID` to swap in Google Maps.</span>
        ) : null}
      </div>
    </div>
  );
}

export function HealthDemoApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Cafe");
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanElapsedMs, setScanElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeSelectionPhoto, setActiveSelectionPhoto] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [competitorPhotoIndexes, setCompetitorPhotoIndexes] = useState<Record<string, number>>({});
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [showPosts, setShowPosts] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 200);
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const placeId = searchParams.get("place_id");
    const category = searchParams.get("category");

    if (!placeId) {
      return;
    }

    const initialCategory = category ?? "Cafe";
    setSelectedCategory(initialCategory);
    setSelected({
      placeId,
      name: searchParams.get("name") ?? "Selected business",
      address: searchParams.get("address") ?? "Google Maps listing",
      category: initialCategory,
      rating: Number(searchParams.get("rating") ?? 0),
      reviewCount: Number(searchParams.get("reviews") ?? 0),
      images: [],
    });

    void runHealthCheck(placeId, initialCategory);
  }, [searchParams]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Search failed.");
        }
        setResults(data.results ?? []);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setError(fetchError instanceof Error ? fetchError.message : "Search failed.");
        }
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const images = useMemo(() => selected?.images?.slice(0, 10) ?? [], [selected]);
  const reportImages = useMemo(() => report?.business.images?.slice(0, 10) ?? [], [report]);

  async function runHealthCheck(placeId: string, category: string) {
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setScanElapsedMs(0);
    setShowMap(false);
    setActiveSelectionPhoto(0);
    setActivePhoto(0);
    setCompetitorPhotoIndexes({});
    setExpandedTheme(null);
    setShowPosts(false);

    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
    }

    const startedAt = Date.now();

    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setScanElapsedMs(elapsed);
      if (elapsed < 15000) {
        setProgress((elapsed / 15000) * 96);
        return;
      }

      const extraProgress = Math.min(3, Math.floor((elapsed - 15000) / 5000));
      setProgress(96 + extraProgress);
    }, 100);

    try {
      const response = await fetch(
        `/api/health?place_id=${encodeURIComponent(placeId)}&category=${encodeURIComponent(category)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Health check failed.");
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < 15000) {
        await new Promise((resolve) => window.setTimeout(resolve, 15000 - elapsed));
      }

      setProgress(100);
      setReport(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "We could not complete the scan. Please try again.",
      );
    } finally {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      setScanElapsedMs(0);
      window.setTimeout(() => setIsLoading(false), 250);
    }
  }

  function reset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setReport(null);
    setError(null);
    setShowMap(false);
    router.replace("/");
  }

  function handleSelect(result: SearchResult) {
    setSelected(result);
    setSelectedCategory(result.category);
    setQuery(result.name);
    setResults([]);
    setReport(null);
    setError(null);
    setActiveSelectionPhoto(0);
  }

  function handleCheck() {
    if (!selected) {
      return;
    }

    const params = new URLSearchParams({
      place_id: selected.placeId,
      category: selectedCategory,
      name: selected.name,
      address: selected.address,
      rating: String(selected.rating),
      reviews: String(selected.reviewCount),
    });
    router.replace(`/?${params.toString()}`, { scroll: false });
    void runHealthCheck(selected.placeId, selectedCategory);
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const scannedAtLabel = report
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(report.scannedAt))
    : "";

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="heroCopy">
          <Image
            src="/maplovin-logo-clean.avif"
            alt="MapLovin"
            width={160}
            height={50}
            className="mb-4 h-auto w-auto"
          />
          <h1>15-second Google Maps location health check</h1>
          <p>Scan location health, competitive pressure, and the next actions to prioritize.</p>
          <div className="heroChips">
            <span>Mobile-first report</span>
            <span>Competitor benchmarking</span>
            <span>Action-led insights</span>
          </div>
        </div>
        <div className="searchPanel">
          <label htmlFor="business-search">Search your business name or address</label>
          <div className="searchInput">
            <Storefront size={20} weight="bold" />
            <input
              id="business-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError(null);
              }}
              placeholder="Search your business name or address..."
            />
          </div>
          {results.length > 0 && (
            <div className="searchResults">
              {results.map((result) => (
                <button key={result.placeId} className="searchResult" onClick={() => handleSelect(result)}>
                  <strong>{result.name}</strong>
                  <span>{result.address}</span>
                  <small>{result.category}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {error && (
        <section className="errorState">
          <WarningCircle size={20} weight="fill" />
          <div>
            <strong>We could not complete that check.</strong>
            <p>{error}</p>
          </div>
          <button onClick={reset}>Try Again</button>
        </section>
      )}

      {selected && !report && (
        <section className="selectionCard">
          <div className="selectionMedia">
            {images.length > 0 ? (
              <div className="selectionHeroImage">
                <Image
                  src={images[activeSelectionPhoto]}
                  alt={`${selected.name} photo ${activeSelectionPhoto + 1}`}
                  width={1200}
                  height={900}
                  sizes="(max-width: 980px) 92vw, 58vw"
                  unoptimized
                />
                {images.length > 1 ? (
                  <>
                    <button
                      className="heroNav left"
                      onClick={() =>
                        setActiveSelectionPhoto((current) =>
                          current === 0 ? images.length - 1 : current - 1,
                        )
                      }
                      aria-label="Previous location photo"
                    >
                      <CaretLeft size={22} weight="bold" />
                    </button>
                    <button
                      className="heroNav right"
                      onClick={() =>
                        setActiveSelectionPhoto((current) =>
                          current === images.length - 1 ? 0 : current + 1,
                        )
                      }
                      aria-label="Next location photo"
                    >
                      <CaretRight size={22} weight="bold" />
                    </button>
                  </>
                ) : null}
                {images.length > 1 ? (
                  <div className="selectionDots">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={index === activeSelectionPhoto ? "active" : ""}
                        onClick={() => setActiveSelectionPhoto(index)}
                        aria-label={`Show location photo ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="carouselFallback">No photos available yet</div>
            )}
          </div>
          <div className="selectionBody">
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.address}</p>
            </div>
            <div className="selectionStats">
              <span>
                <Star size={16} weight="fill" />
                {selected.rating ? selected.rating.toFixed(1) : "Live"}
              </span>
              <span>{selected.reviewCount ? `${selected.reviewCount} reviews` : "Google listing"}</span>
            </div>
            <div className="categoryRow">
              <label htmlFor="category">Business Category</label>
              <div className="selectWrap">
                <input
                  id="category"
                  value={selectedCategory}
                  placeholder="Cafe"
                  onChange={(event) => setSelectedCategory(event.target.value)}
                />
              </div>
              <p className="fieldHint">This helps us find the right competitors nearby.</p>
            </div>
            <div className="selectionActions">
              <button className="primaryButton" onClick={handleCheck}>
                Check My Health <ArrowRight size={18} weight="bold" />
              </button>
              <button className="selectionCancel" onClick={reset}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {isLoading ? <ProgressOverlay progress={progress} elapsedMs={scanElapsedMs} /> : null}
      </AnimatePresence>

      {report && (
        <div className="reportShell">
          <section className="scoreHero">
            <div className="scoreHeroTop">
              <div>
                <div className="heroBadge">Overall Health Score</div>
                <h2>{report.business.name}</h2>
              </div>
              <div className="scanStamp topRight">
                <CalendarDots size={16} weight="bold" />
                <span>Scanned {scannedAtLabel}</span>
              </div>
            </div>
            <div className="scoreHeroBody">
              <div className="scoreHeroLeft">
                <ScoreGauge score={report.score} color={report.color} />
                <div className="scoreMeta">
                  <div className="scoreFacts">
                    <span>
                      <Star size={16} weight="fill" />
                      {report.business.rating.toFixed(1)} stars
                    </span>
                    <span>{report.business.reviewCount} reviews</span>
                  </div>
                  <p>{report.business.address}</p>
                </div>
              </div>
              {reportImages.length > 0 ? (
                <div className="heroCarousel">
                  <div className="heroCarouselImage">
                    <div className="heroCarouselFrame">
                      <Image
                        src={reportImages[activePhoto]}
                        alt={`${report.business.name} photo ${activePhoto + 1}`}
                        width={1200}
                        height={900}
                        sizes="(max-width: 980px) 92vw, 32vw"
                        unoptimized
                      />
                    </div>
                    {reportImages.length > 1 ? (
                      <>
                        <button
                          className="heroNav left"
                          onClick={() =>
                            setActivePhoto((current) =>
                              current === 0 ? reportImages.length - 1 : current - 1,
                            )
                          }
                          aria-label="Previous photo"
                        >
                          <CaretLeft size={22} weight="bold" />
                        </button>
                        <button
                          className="heroNav right"
                          onClick={() =>
                            setActivePhoto((current) =>
                              current === reportImages.length - 1 ? 0 : current + 1,
                            )
                          }
                          aria-label="Next photo"
                        >
                          <CaretRight size={22} weight="bold" />
                        </button>
                      </>
                    ) : null}
                  </div>
                  {reportImages.length > 1 ? (
                    <div className="heroCarouselControls">
                      <div className="heroCarouselDots">
                        {reportImages.map((_, index) => (
                          <button
                            key={index}
                            className={index === activePhoto ? "active" : ""}
                            onClick={() => setActivePhoto(index)}
                            aria-label={`Show photo ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {report.warnings.length > 0 && (
            <section className="warningStack">
              {report.warnings.map((warning) => (
                <div key={warning.message} className={`warningCard ${warning.type}`}>
                  <WarningCircle size={18} weight="fill" />
                  <div>
                    <p>{warning.message}</p>
                    {warning.ctaHref && warning.ctaLabel ? (
                      <a href={warning.ctaHref} target="_blank" rel="noreferrer">
                        {warning.ctaLabel} <ArrowRight size={14} weight="bold" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="insightRow">
            {report.insightCards.map((card) => (
              <button
                key={card.id}
                className={`insightCard ${card.kind}`}
                onClick={() => scrollToSection(card.target)}
              >
                <span>{card.icon}</span>
                <strong>{card.title}</strong>
                <p>{card.body}</p>
              </button>
            ))}
          </section>

          <section className="sectionCard" id="breakdown">
            <div className="sectionHeader">
              <h3>Score breakdown</h3>
            </div>
            <div className="breakdownGrid">
              {report.breakdown.map((category) => (
              <section
                  key={category.id}
                  className={`breakdownCard ${category.status}`}
                  id={category.id}
                >
                  <div className="breakdownCardTop">
                    <div className="summaryLeft">
                      <span className="summaryIcon">{categoryIcon(category.id)}</span>
                      <div className="breakdownHeadline">
                        <strong>{category.title}</strong>
                      </div>
                    </div>
                    <div className={`summaryScore ${category.status}`}>
                      <span className="summaryPercent">{category.percent}%</span>
                      <span className="summaryStatusIcon">{statusIcon(category.status)}</span>
                    </div>
                  </div>
                  <div className="criterionList compact">
                    {category.subcriteria.map((criterion) => (
                      <div key={criterion.id} className="criterionRow">
                        <div className="criterionMain">
                          <span className={`criterionStatus ${criterionStatus(criterion.score, criterion.maxScore)}`}>
                            {statusIcon(criterionStatus(criterion.score, criterion.maxScore))}
                          </span>
                          <div className="criterionText">
                            <strong>{criterion.label}</strong>
                            {shouldShowCriterionValue(category.id) ? <span>{criterion.value}</span> : null}
                          </div>
                        </div>
                        <div className="criterionScore">
                          <p className="criterionAction">{criterion.action ?? criterion.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {category.id === "posts" && report.business.posts.length > 0 ? (
                    <div className="expanderArea">
                      <button className="expandToggle" onClick={() => setShowPosts((current) => !current)}>
                        {showPosts ? "Hide recent posts" : "Show recent posts"}
                        {showPosts ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                      </button>
                      {showPosts ? (
                        <div className="bubbleList">
                          {report.business.posts.slice(0, 5).map((post, index) => (
                            <div key={`${post.content}-${index}`} className="bubbleCard">
                              <p>{post.content}</p>
                              <div className="bubbleMeta">
                                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB") : "Recent post"}</span>
                                {post.url ? (
                                  <a href={post.url} target="_blank" rel="noreferrer">
                                    Open on Google <Link size={14} weight="bold" />
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </section>

          <section className="sectionCard" id="review-themes">
            <div className="sectionHeader">
              <h3>What customers are saying about you</h3>
            </div>
            <div className="themeGrid">
              {report.business.reviewThemes.map((theme) => (
                <div key={theme.theme} className={`themeChip ${theme.sentiment}`}>
                  <button className="themeToggle" onClick={() => setExpandedTheme((current) => current === theme.theme ? null : theme.theme)}>
                    <div>
                      <strong>
                        {theme.theme}
                      </strong>
                      <p>{theme.summary}</p>
                    </div>
                    {expandedTheme === theme.theme ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
                  </button>
                  {expandedTheme === theme.theme ? (
                    <div className="bubbleList reviewGrid">
                      {theme.reviews.length > 0 ? (
                        theme.reviews.map((review, index) => (
                          <div key={`${theme.theme}-${index}`} className="bubbleCard reviewBubble">
                            <div className="reviewHeader">
                              <div className="reviewerIdentity">
                                {review.avatarUrl ? (
                                  <Image
                                    src={review.avatarUrl}
                                    alt={review.author ?? "Reviewer"}
                                    width={44}
                                    height={44}
                                    className="reviewAvatar"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="reviewAvatar fallback">{reviewerInitials(review.author)}</div>
                                )}
                                <div>
                                  <strong>{review.author ?? "Google reviewer"}</strong>
                                  <div className="reviewMetaLine">
                                    <span className="reviewStars">
                                      <Star size={14} weight="fill" />
                                      {review.rating ?? "Review"}
                                    </span>
                                    <span>{formatShortDate(review.publishedAt)}</span>
                                  </div>
                                </div>
                              </div>
                              {review.url ? (
                                <a href={review.url} target="_blank" rel="noreferrer" aria-label="Open review on Google Maps">
                                  <ArrowSquareOut size={16} weight="bold" />
                                </a>
                              ) : null}
                            </div>
                            <p>{review.text}</p>
                            {review.themes?.length ? (
                              <div className="themePills">
                                {review.themes.map((reviewTheme) => (
                                  <span
                                    key={`${theme.theme}-${index}-${reviewTheme}`}
                                    className={`themePill ${reviewTheme === theme.theme ? "active" : ""}`}
                                  >
                                    {reviewTheme}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="bubbleCard reviewBubble">
                          <p>No linked review excerpts were available for this theme in the latest scan.</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="sectionCard" id="competitors">
            <div className="sectionHeader">
              <h3>Your top competitors</h3>
            </div>
            <div className="competitorGrid">
              {report.business.competitors.map((competitor) => {
                const competitorUrl = `/?place_id=${encodeURIComponent(competitor.placeId)}&category=${encodeURIComponent(competitor.category)}&name=${encodeURIComponent(competitor.name)}&address=${encodeURIComponent(competitor.address)}&rating=${competitor.rating}&reviews=${competitor.reviewCount}`;
                const competitorImages = competitor.images?.length ? competitor.images : competitor.imageUrl ? [competitor.imageUrl] : [];
                const activeCompetitorPhoto = competitorPhotoIndexes[competitor.placeId] ?? 0;

                return (
                  <div key={competitor.placeId} className={`competitorCard ${competitor.isCurrent ? "current" : ""}`}>
                    <div className="competitorImageWrap">
                      {competitorImages.length > 0 ? (
                        <Image
                          src={competitorImages[activeCompetitorPhoto]}
                          alt={competitor.name}
                          width={1200}
                          height={900}
                          sizes="(max-width: 720px) 90vw, (max-width: 980px) 46vw, 22vw"
                          unoptimized
                        />
                      ) : (
                        <div className="competitorImageFallback">{competitor.rank}</div>
                      )}
                      {competitorImages.length > 1 ? (
                        <>
                          <button
                            className="heroNav left"
                            onClick={() =>
                              setCompetitorPhotoIndexes((current) => ({
                                ...current,
                                [competitor.placeId]:
                                  activeCompetitorPhoto === 0 ? competitorImages.length - 1 : activeCompetitorPhoto - 1,
                              }))
                            }
                            aria-label={`Previous photo for ${competitor.name}`}
                          >
                            <CaretLeft size={18} weight="bold" />
                          </button>
                          <button
                            className="heroNav right"
                            onClick={() =>
                              setCompetitorPhotoIndexes((current) => ({
                                ...current,
                                [competitor.placeId]:
                                  activeCompetitorPhoto === competitorImages.length - 1 ? 0 : activeCompetitorPhoto + 1,
                              }))
                            }
                            aria-label={`Next photo for ${competitor.name}`}
                          >
                            <CaretRight size={18} weight="bold" />
                          </button>
                        </>
                      ) : null}
                      <div className="competitorOverlay" />
                      <div className="competitorCardBody">
                        <div>
                          <div className="competitorTop">
                            <strong>{competitor.name}</strong>
                          </div>
                          <p>{competitor.address}</p>
                          <div className="competitorMeta">
                            <span>
                              <Star size={14} weight="fill" />
                              {competitor.rating.toFixed(1)}
                            </span>
                            <span>{competitor.reviewCount} reviews</span>
                          </div>
                        </div>
                        <div className="competitorActions cardActions">
                          {!competitor.isCurrent ? (
                            <a href={competitorUrl} target="_blank" rel="noreferrer">
                              Check
                            </a>
                          ) : null}
                          <a href={competitor.mapUrl} target="_blank" rel="noreferrer">
                            View on Map
                          </a>
                        </div>
                        {competitorImages.length > 1 ? (
                          <div className="competitorDots">
                            {competitorImages.map((_, index) => (
                              <button
                                key={index}
                                className={index === activeCompetitorPhoto ? "active" : ""}
                                onClick={() =>
                                  setCompetitorPhotoIndexes((current) => ({
                                    ...current,
                                    [competitor.placeId]: index,
                                  }))
                                }
                                aria-label={`Show photo ${index + 1} for ${competitor.name}`}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="outlineButtonNavy" onClick={() => setShowMap((current) => !current)}>
              {showMap ? "Hide Map" : "View on Map"} <MapPin size={16} weight="fill" />
            </button>
            <CompetitorMap report={report} visible={showMap} />
          </section>

          <section className="sectionCard" id="actions">
            <div className="sectionHeader">
              <h3>Your next steps</h3>
            </div>
            <div className="actionList">
              {report.actions.map((action) => (
                <div key={action.id} className="actionCard">
                  <div className="actionIcon">{renderActionIcon(action.icon)}</div>
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.reason}</p>
                  </div>
                  {action.href ? (
                    <a href={action.href} target="_blank" rel="noreferrer" className="ghostButton">
                      Open <ArrowRight size={14} weight="bold" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="sectionCard" id="maplovin-benefits">
            <div className="sectionHeader">
              <h3>Why work with MapLovin</h3>
            </div>
            <div className="resourceList">
              {mapLovinBenefits.map((benefit) => (
                <div key={benefit} className="resourceCard benefitCard">
                  <div>
                    <strong>{benefit}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="sectionCard" id="gbp-best-practices">
            <div className="sectionHeader">
              <h3>Google Business Profile best practices</h3>
            </div>
            <div className="resourceList">
              {gbpBestPractices.map((item) => (
                <a key={item.href} className="resourceCard" href={item.href} target="_blank" rel="noreferrer">
                  <div>
                    <strong>{item.title}</strong>
                  </div>
                  <ArrowSquareOut size={18} weight="bold" />
                </a>
              ))}
            </div>
          </section>
          <ContactUsSection />
        </div>
      )}
    </main>
  );
}
