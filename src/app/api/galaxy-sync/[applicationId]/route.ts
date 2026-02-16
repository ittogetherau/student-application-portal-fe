import { authOptions } from "@/shared/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type RouteParams = {
  applicationId: string;
};

type SessionWithTokens = {
  accessToken?: string;
  tokenType?: string;
};

const SECTION_PATHS: Record<string, string> = {
  enrollment: "enrollment",
  "personal-details": "personal-details",
  "emergency-contact": "emergency-contact",
  oshc: "oshc",
  language: "language",
  disability: "disability",
  schooling: "schooling",
  qualifications: "qualifications",
  employment: "employment",
  usi: "usi",
  documents: "documents",
  declaration: "declaration",
};

const resolveApiBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_PATH ||
    "";
  const normalized = raw.replace(/\/+$/, "");
  return normalized || null;
};

const readResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload: unknown) => {
  if (!payload) return null;
  if (typeof payload === "string" && payload.trim()) return payload;
  if (typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.error === "string" && body.error) return body.error;

  return null;
};

const syncSection = async ({
  baseUrl,
  applicationId,
  tokenType,
  accessToken,
  sectionKey,
  sectionPath,
}: {
  baseUrl: string;
  applicationId: string;
  tokenType: string;
  accessToken: string;
  sectionKey: string;
  sectionPath: string;
}) => {
  const endpoint = `${baseUrl}/staff/applications/${applicationId}/galaxy-sync/${sectionPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) || `Failed to sync ${sectionKey}.`,
    );
  }

  return { section: sectionKey, data: payload };
};

export async function POST(
  _: Request,
  context: { params: Promise<RouteParams> },
) {
  const { applicationId } = await context.params;

  if (!applicationId) {
    return NextResponse.json(
      { success: false, message: "Missing application id." },
      { status: 400 },
    );
  }

  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "Missing API base URL configuration." },
      { status: 500 },
    );
  }

  const session = (await getServerSession(authOptions)) as SessionWithTokens;
  const accessToken = session?.accessToken;
  const tokenType = session?.tokenType || "Bearer";

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const sectionEntries = Object.entries(SECTION_PATHS);

  const results = await Promise.allSettled(
    sectionEntries.map(([sectionKey, sectionPath]) =>
      syncSection({
        baseUrl,
        applicationId,
        tokenType,
        accessToken,
        sectionKey,
        sectionPath,
      }),
    ),
  );

  const synced = results
    .filter((result): result is PromiseFulfilledResult<{ section: string; data: unknown }> => result.status === "fulfilled")
    .map((result) => result.value);

  const failed = results
    .map((result, index) => {
      if (result.status === "fulfilled") return null;
      const [section] = sectionEntries[index] ?? ["unknown"];
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown sync failure.";
      return { section, reason };
    })
    .filter((item): item is { section: string; reason: string } => item !== null);

  if (failed.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to sync ${failed.length} section${failed.length === 1 ? "" : "s"}.`,
        data: { synced, failed },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "All sections synced successfully.",
    data: { synced, failed: [] },
  });
}
