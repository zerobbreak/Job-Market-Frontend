import { account } from "./appwrite";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
  retries?: number;
  backoff?: number;
}

// Token Caching & Deduplication Strategy
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let tokenRefreshPromise: Promise<string | null> | null = null;
const TOKEN_LIFETIME = 14 * 60 * 1000; // 14 minutes (Appwrite JWTs last 15m)

const getValidToken = async (forceRefresh = false): Promise<string | null> => {
  const now = Date.now();

  // 1. Return cached token if valid and no force refresh requested
  if (!forceRefresh && cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  // 2. Return existing promise if a refresh is already in progress
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  // 3. Initiate new token refresh
  tokenRefreshPromise = (async () => {
    try {
      const jwt = await account.createJWT();
      cachedToken = jwt.jwt;
      tokenExpiry = now + TOKEN_LIFETIME;
      return cachedToken;
    } catch (error) {
      console.warn("Failed to create JWT:", error);
      return null;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = async (endpoint: string, options: ApiOptions = {}) => {
  // Default: 3 retries, start with 300ms delay
  const { retries = 3, backoff = 300, ...fetchOptions } = options;

  const executeRequest = async (
    attempt: number,
    freshToken = false,
  ): Promise<Response> => {
    const token = await getValidToken(freshToken);

    const headers: Record<string, string> = {
      ...(fetchOptions.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (
      !(fetchOptions.body instanceof FormData) &&
      !("Content-Type" in headers)
    ) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers: headers as HeadersInit,
      });

      // Handle 401 Unauthorized - Retry ONCE with fresh token
      if (response.status === 401 && !freshToken) {
        console.log("401 received, attempting to refresh token and retry...");
        // Force invalidation of cache
        cachedToken = null;
        tokenExpiry = null;
        return executeRequest(attempt, true);
      }

      if (response.status === 401 && freshToken) {
        console.error("Unauthorized access. Token refresh failed.");
        window.dispatchEvent(new Event("auth:failure"));
        throw new Error("Unauthorized: Please log in again.");
      }

      // Handle 5xx Server Errors -> Retry with backoff
      if (response.status >= 500 && attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        console.warn(
          `Server error ${response.status}, retrying in ${delay}ms...`,
        );
        await wait(delay);
        return executeRequest(attempt + 1, freshToken);
      }

      return response;
    } catch (error) {
      // Handle Network Errors (fetch throws) -> Retry with backoff
      if (attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        console.warn(`Network error, retrying in ${delay}ms...`, error);
        await wait(delay);
        return executeRequest(attempt + 1, freshToken);
      }
      throw error;
    }
  };

  return executeRequest(0);
};
