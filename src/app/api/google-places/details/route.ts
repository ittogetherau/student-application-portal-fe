import { NextResponse, type NextRequest } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/details/json";
const LANGUAGE = "en-US";
const FIELDS = "address_component";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const TOKEN = process.env.GOOGLE_PLACES_AUTOCOMPLETE_TOKEN ?? "";

const buildDetailsUrl = (placeId: string) => {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: FIELDS,
    language: LANGUAGE,
    key: API_KEY,
  });

  if (TOKEN) {
    params.set("sessiontoken", TOKEN);
  }

  return `${BASE_URL}?${params.toString()}`;
};

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId")?.trim() ?? "";

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId." }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing Google Places API key." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(buildDetailsUrl(placeId), {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Accept-Language": LANGUAGE,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      status?: string;
      result?: { address_components?: unknown[] };
      error_message?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch place details." },
        { status: response.status }
      );
    }

    if (payload.status === "ZERO_RESULTS") {
      return NextResponse.json({ address_components: [] });
    }

    if (payload.status !== "OK") {
      return NextResponse.json(
        {
          error: payload.error_message || "Failed to fetch place details.",
          status: payload.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      address_components: payload.result?.address_components ?? [],
    });
  } catch (error) {
    console.error("[Places] Details failed", error);
    return NextResponse.json(
      { error: "Failed to fetch place details." },
      { status: 500 }
    );
  }
}
