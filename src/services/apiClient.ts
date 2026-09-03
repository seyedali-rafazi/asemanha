/**
 * Base API Client for Asemanha Backend API
 */

const DEFAULT_API_BASE =
  (import.meta.env.VITE_API_BASE_URL &&
   !import.meta.env.VITE_API_BASE_URL.includes("onrender.com"))
    ? import.meta.env.VITE_API_BASE_URL
    : "/api/v1";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 35000, params, headers = {}, ...customConfig } = options;

  let url: string;
  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else if (endpoint.startsWith("/api/")) {
    url = endpoint;
  } else if (endpoint.startsWith("/health")) {
    url = endpoint;
  } else {
    url = `${DEFAULT_API_BASE.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      const message =
        typeof errorBody === "object" && errorBody && "detail" in errorBody
          ? String((errorBody as { detail: unknown }).detail)
          : `HTTP error ${response.status}: ${response.statusText}`;

      throw new ApiError(message, response.status, errorBody);
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timed out after " + timeoutMs + "ms", 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

export { DEFAULT_API_BASE };
