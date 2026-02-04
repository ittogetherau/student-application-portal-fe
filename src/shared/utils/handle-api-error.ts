import axios from "axios";

type GalaxyError = {
  message?: string | string[];
  data?: Record<string, string | string[]>;
  [key: string]: unknown;
};

type ApiErrorBody = {
  detail?: string;
  message?: string;
  error?: string;
  galaxy_error?: GalaxyError;
} & Record<string, unknown>;

const formatGalaxyError = (error?: GalaxyError) => {
  if (!error) return null;
  const details: string[] = [];

  if (Array.isArray(error.message)) {
    details.push(error.message.join(", "));
  } else if (typeof error.message === "string") {
    details.push(error.message);
  }

  if (error.data && typeof error.data === "object") {
    Object.entries(error.data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        value.forEach((msg) => details.push(`${field}: ${msg}`));
      } else if (typeof value === "string") {
        details.push(`${field}: ${value}`);
      }
    });
  }

  return details.length ? details.join(" | ") : null;
};

const extractErrorMessage = (payload?: ApiErrorBody) => {
  if (!payload) return null;
  if (typeof payload.detail === "string" && payload.detail) return payload.detail;
  if (typeof payload.message === "string" && payload.message) return payload.message;
  if (typeof payload.error === "string" && payload.error) return payload.error;
  return formatGalaxyError(payload.galaxy_error);
};

export const handleApiError = <T = null>(
  error: unknown,
  fallbackMessage: string,
  defaultData: T = null as T
) => {
  let errorMessage = fallbackMessage;
  let payload: ApiErrorBody | undefined;

  if (axios.isAxiosError(error)) {
    payload = error.response?.data as ApiErrorBody | undefined;
    errorMessage =
      extractErrorMessage(payload) || error.message || fallbackMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return {
    success: false,
    data: defaultData,
    message: errorMessage,
    error: payload,
  };
};
