import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const API_URL = process.env.API_URL || "http://localhost:8000/api/v1";

export const SESSION_COOKIE_NAME = "session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days — matches the backend JWT's own lifetime
};

function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
}

async function fetchMe(token: string): Promise<SessionUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Reads the session cookie and resolves the current backend user, or null. */
export const getSessionUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    const token = getCookie(SESSION_COOKIE_NAME);
    if (!token) return null;
    const user = await fetchMe(token);
    if (!user) clearSessionCookie();
    return user;
  },
);

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }): Promise<SessionUser> => {
    const res = await fetch(`${API_URL}/auth/jwt/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: data.email, password: data.password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ? String(body.detail) : "Invalid email or password");
    }
    const { access_token } = (await res.json()) as { access_token: string };
    setSessionCookie(access_token);
    const user = await fetchMe(access_token);
    if (!user) throw new Error("Login succeeded but failed to load user profile");
    return user;
  });

export const registerFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; name: string }) => data)
  .handler(async ({ data }): Promise<SessionUser> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password, name: data.name }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ? String(body.detail) : "Failed to register");
    }
    // Register doesn't return a token — log in right after to establish the session.
    const loginRes = await fetch(`${API_URL}/auth/jwt/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: data.email, password: data.password }),
    });
    if (!loginRes.ok) {
      throw new Error("Registered, but failed to log in automatically");
    }
    const { access_token } = (await loginRes.json()) as { access_token: string };
    setSessionCookie(access_token);
    const user = await fetchMe(access_token);
    if (!user) throw new Error("Registered but failed to load user profile");
    return user;
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  // The backend JWT is stateless (no server-side blacklist) — clearing the
  // cookie is what actually logs the user out here.
  clearSessionCookie();
});

export const forgotPasswordFn = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; password: string }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token, password: data.password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ? String(body.detail) : "Failed to reset password");
    }
  });
