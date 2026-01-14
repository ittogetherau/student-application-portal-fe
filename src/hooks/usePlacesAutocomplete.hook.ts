"use client";

import { useEffect, useRef, useState } from "react";

type UsePlacesAutocompleteOptions = {
  debounceMs?: number;
  enabled?: boolean;
  minLength?: number;
};

type UsePlacesAutocompleteResult = {
  query: string;
  setQuery: (value: string) => void;
  data: PlacePrediction[];
  isLoading: boolean;
  error: string | null;
};

type PlacePrediction = {
  description: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

export const usePlacesAutocomplete = (
  initialQuery = "",
  {
    debounceMs = 400,
    enabled = true,
    minLength = 2,
  }: UsePlacesAutocompleteOptions = {}
): UsePlacesAutocompleteResult => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [data, setData] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (!enabled) return;
    if (debouncedQuery.length < minLength) {
      setData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const currentId = ++lastRequestId.current;
    const controller = new AbortController();

    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/google-places/autocomplete?query=${encodeURIComponent(
            debouncedQuery
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to fetch suggestions.");
        }

        const payload = (await response.json()) as {
          predictions?: PlacePrediction[];
          error?: string;
        };

        if (currentId === lastRequestId.current) {
          setData(payload.predictions ?? []);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (currentId === lastRequestId.current) {
          setError(err instanceof Error ? err.message : "Request failed.");
          setData([]);
        }
      } finally {
        if (currentId === lastRequestId.current) {
          setIsLoading(false);
        }
      }
    };

    fetchPredictions();

    return () => controller.abort();
  }, [debouncedQuery, enabled, minLength]);

  return {
    query,
    setQuery,
    data,
    isLoading,
    error,
  };
};

export default usePlacesAutocomplete;
