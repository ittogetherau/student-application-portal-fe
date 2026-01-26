/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatParamUrl = (
  params: Record<string, any>,
  fallbackUrl: string
) => {
  const hasWindow = typeof window !== "undefined";

  // Use current pathname if available, otherwise fallback
  const pathname =
    hasWindow && window.location.pathname
      ? window.location.pathname
      : fallbackUrl;

  // Build query string only from provided params
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  // Return full URL
  const url = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;
  return url;
};
