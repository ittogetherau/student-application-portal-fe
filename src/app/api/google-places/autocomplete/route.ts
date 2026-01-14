import { NextResponse, type NextRequest } from "next/server";

const BASE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const LANGUAGE = "en-US";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const TOKEN = process.env.GOOGLE_PLACES_AUTOCOMPLETE_TOKEN ?? "";

const buildAutocompleteUrl = (query: string) => {
  const params = new URLSearchParams({
    input: query,
    language: LANGUAGE,
    key: API_KEY,
  });

  if (TOKEN) {
    params.set("sessiontoken", TOKEN);
  }

  return `${BASE_URL}?${params.toString()}`;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing Google Places API key." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(buildAutocompleteUrl(query), {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Accept-Language": LANGUAGE,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      status?: string;
      predictions?: unknown[];
      error_message?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch suggestions." },
        { status: response.status }
      );
    }

    if (payload.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] });
    }

    if (payload.status !== "OK") {
      return NextResponse.json(
        {
          error: payload.error_message || "Failed to fetch suggestions.",
          status: payload.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ predictions: payload.predictions ?? [] });
  } catch (error) {
    console.error("[Places] Autocomplete failed", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions." },
      { status: 500 }
    );
  }
}
