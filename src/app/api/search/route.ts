import { NextResponse } from "next/server";
import { z } from "zod";
import { searchAddresses } from "@/lib/nyc-data/geosearch";

const querySchema = z.string().trim().min(3).max(160);

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(
    new URL(request.url).searchParams.get("q"),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter at least 3 characters of a NYC address." },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      { results: await searchAddresses(parsed.data) },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=3600" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Address search is unavailable.",
      },
      { status: 502 },
    );
  }
}
