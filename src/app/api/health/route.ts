import { getHealthReport } from "@/lib/health-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place_id");
  const category = searchParams.get("category") ?? undefined;

  if (!placeId) {
    return NextResponse.json({ error: "Missing place_id parameter." }, { status: 400 });
  }

  try {
    const report = await getHealthReport(placeId, category);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Health check failed." },
      { status: 500 },
    );
  }
}
