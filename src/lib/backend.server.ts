import { getCookie } from "@tanstack/react-start/server";
import { SESSION_COOKIE_NAME } from "./auth";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000/api/v1";

interface BackendRequestOptions extends RequestInit {
  headers?: Record<string, string>;
  retries?: number;
  backoff?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Server-only fetch wrapper for the FastAPI backend. Reads the caller's
 * session cookie (the backend's own JWT) and calls the backend directly from
 * this Node process (server-to-server — never exposed to the browser).
 */
export const backendFetch = async (
  endpoint: string,
  options: BackendRequestOptions = {},
): Promise<Response> => {
  const { retries = 3, backoff = 300, ...fetchOptions } = options;

  const executeRequest = async (attempt: number): Promise<Response> => {
    const token = getCookie(SESSION_COOKIE_NAME);
    if (!token) {
      throw new Error("Not authenticated");
    }

    const headers: Record<string, string> = {
      ...(fetchOptions.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    if (!(fetchOptions.body instanceof FormData) && !("Content-Type" in headers)) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers: headers as HeadersInit,
      });

      if (response.status >= 500 && attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        await wait(delay);
        return executeRequest(attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        await wait(delay);
        return executeRequest(attempt + 1);
      }
      throw error;
    }
  };

  return executeRequest(0);
};

export const backendJson = async <T>(endpoint: string, options?: BackendRequestOptions): Promise<T> => {
  const response = await backendFetch(endpoint, options);
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};
