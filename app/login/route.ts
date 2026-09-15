import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  STATE_COOKIE,
  buildAuthorizationURL,
  createOAuthState,
  sessionCookieOptions,
} from "@/lib/oauth";

export async function GET(request: Request) {
  const state = createOAuthState();
  const baseURL = new URL(request.url).origin;
  const response = NextResponse.redirect(buildAuthorizationURL(baseURL, state));

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(STATE_COOKIE, state, sessionCookieOptions);

  return response;
}
