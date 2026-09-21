import { createHash, randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";

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
export const NONCE_COOKIE = "nonce";
export const CODE_VERIFIER_COOKIE = "code_verifier";
export const CODE_CHALLENGE_METHOD = "S256";

export const sessionCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function createOAuthState() {
  return randomBytes(16).toString("hex");
}

export function createOAuthNonce() {
  return randomBytes(16).toString("hex");
}

export function bindStateNonce(state: string, nonce: string) {
  return `${state}.${nonce}`;
}

export function splitStateNonce(value: string | undefined) {
  if (!value) {
    return { state: undefined, nonce: undefined };
  }

  const separator = value.indexOf(".");

  if (separator === -1) {
    return { state: value, nonce: undefined };
  }

  return {
    state: value.slice(0, separator),
    nonce: value.slice(separator + 1),
  };
}

export function createCodeVerifier() {
  return randomBytes(32).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function buildRedirectURI(baseURL: string) {
  return `${baseURL}/auth/github/callback`;
}

export function buildAuthorizationURL(
  baseURL: string,
  state: string,
  codeChallenge: string,
  nonce: string,
) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: githubClientID,
    redirect_uri: buildRedirectURI(baseURL),
    scope: "user public_repo",
    state: bindStateNonce(state, nonce),
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });

  return `${authorizeURL}?${params.toString()}`;
}

export function getRequestOrigin(req: IncomingMessage) {
  const host = req.headers.host ?? "localhost:3000";
  const protoHeader = req.headers["x-forwarded-proto"];
  const protocol =
    (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ?? "http";

  return `${protocol}://${host}`;
}

export function firstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function serializeSessionCookie(
  name: string,
  value: string,
  extra: { maxAge?: number } = {},
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${sessionCookieOptions.path}`,
  ];

  if (extra.maxAge !== undefined) {
    parts.push(`Max-Age=${extra.maxAge}`);
  }

  if (sessionCookieOptions.httpOnly) {
    parts.push("HttpOnly");
  }

  if (sessionCookieOptions.secure) {
    parts.push("Secure");
  }

  parts.push(`SameSite=${sessionCookieOptions.sameSite}`);

  return parts.join("; ");
}

export async function apiRequest(
  url: string,
  accessToken?: string,
  post: Record<string, string> | false = false,
) {
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
  });

  return response.json();
}
