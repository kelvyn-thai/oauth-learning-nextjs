import { CODE_CHALLENGE_METHOD } from "@/lib/github";

export const googleClientID = process.env.GOOGLE_CLIENT_ID ?? "";
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

export const googleAuthorizeURL = "https://accounts.google.com/o/oauth2/v2/auth";
export const googleTokenURL = "https://www.googleapis.com/oauth2/v4/token";
export const googleUserInfoURL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const GOOGLE_ACCESS_TOKEN_COOKIE = "google_access_token";
export const GOOGLE_USER_ID_COOKIE = "google_user_id";
export const GOOGLE_EMAIL_COOKIE = "google_email";

export function buildGoogleRedirectURI(baseURL: string) {
  return `${baseURL}/auth/google/callback`;
}

export function buildGoogleAuthorizationURL(
  baseURL: string,
  state: string,
  codeChallenge: string,
  nonce: string,
) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: googleClientID,
    redirect_uri: buildGoogleRedirectURI(baseURL),
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });

  return `${googleAuthorizeURL}?${params.toString()}`;
}

export function parseIdTokenPayload(idToken: string) {
  const payload = idToken.split(".")[1];

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      email?: string;
      nonce?: string;
    };
  } catch {
    return null;
  }
}
