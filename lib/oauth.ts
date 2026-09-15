import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";

// Fill these out with the values from GitHub
export const githubClientID = process.env.GITHUB_CLIENT_ID ?? "";
export const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";

// This is the URL we'll send the user to first to get their authorization
export const authorizeURL = "https://github.com/login/oauth/authorize";

// This is the endpoint we'll request an access token from
export const tokenURL = "https://github.com/login/oauth/access_token";

// This is the GitHub base URL for API requests
export const apiURLBase = "https://api.github.com/";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const STATE_COOKIE = "state";

export const sessionCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function createOAuthState() {
  return randomBytes(16).toString("hex");
}

export function buildAuthorizationURL(baseURL: string, state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: githubClientID,
    redirect_uri: baseURL,
    scope: "user public_repo",
    state,
  });

  return `${authorizeURL}?${params.toString()}`;
}

// The URL for this app, used as the redirect URL
export async function getBaseURL() {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function apiRequest(
  url: string,
  post: Record<string, string> | false = false,
) {
  const accessToken = await getAccessToken();
  const headersInit: HeadersInit = {
    Accept: "application/vnd.github.v3+json, application/json",
    "User-Agent": "https://example-app.com/",
  };

  if (accessToken) {
    headersInit.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: post ? "POST" : "GET",
    headers: post
      ? {
          ...headersInit,
          "Content-Type": "application/x-www-form-urlencoded",
        }
      : headersInit,
    body: post ? new URLSearchParams(post).toString() : undefined,
    cache: "no-store",
  });

  return response.json();
}
