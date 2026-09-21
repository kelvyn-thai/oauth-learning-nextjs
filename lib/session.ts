import type { Session } from "next-auth";
import {
  GOOGLE_ACCESS_TOKEN_COOKIE,
  GOOGLE_USER_ID_COOKIE,
  googleUserInfoURL,
} from "@/lib/google";
import { ACCESS_TOKEN_COOKIE, apiRequest, apiURLBase } from "@/lib/github";

export type Provider = "github" | "google" | "keycloak";

export type ProfileUser = {
  provider: Provider;
  id: string;
  name: string | null;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
  bio: string | null;
  publicRepos: number | null;
  followers: number | null;
  following: number | null;
};

type CookieBag = Partial<Record<string, string>>;

export function getActiveProvider(
  cookies: CookieBag,
  keycloakSession?: Session | null,
): Provider | null {
  if (cookies[ACCESS_TOKEN_COOKIE]) {
    return "github";
  }

  if (cookies[GOOGLE_ACCESS_TOKEN_COOKIE] && cookies[GOOGLE_USER_ID_COOKIE]) {
    return "google";
  }

  if (keycloakSession) {
    return "keycloak";
  }

  return null;
}

export async function loadProfile(
  cookies: CookieBag,
  keycloakSession?: Session | null,
): Promise<ProfileUser | null> {
  const provider = getActiveProvider(cookies, keycloakSession);

  if (provider === "github") {
    return loadGitHubProfile(cookies[ACCESS_TOKEN_COOKIE] as string);
  }

  if (provider === "google") {
    return loadGoogleProfile(cookies[GOOGLE_ACCESS_TOKEN_COOKIE] as string);
  }

  if (provider === "keycloak" && keycloakSession) {
    return loadKeycloakProfile(keycloakSession);
  }

  return null;
}

function loadKeycloakProfile(session: Session): ProfileUser {
  const user = session.user ?? {};

  return {
    provider: "keycloak",
    id: session.sub ?? user.email ?? "keycloak-user",
    name: user.name ?? null,
    handle: user.email ?? user.name ?? "keycloak-user",
    email: user.email ?? null,
    avatarUrl: user.image ?? null,
    profileUrl: null,
    bio: null,
    publicRepos: null,
    followers: null,
    following: null,
  };
}

async function loadGitHubProfile(accessToken: string): Promise<ProfileUser | null> {
  const user = await apiRequest(`${apiURLBase}user`, accessToken);

  if (
    typeof user !== "object" ||
    user === null ||
    typeof user.login !== "string"
  ) {
    return null;
  }

  return {
    provider: "github",
    id: String(user.id ?? user.login),
    name: typeof user.name === "string" ? user.name : null,
    handle: user.login,
    email: typeof user.email === "string" ? user.email : null,
    avatarUrl: typeof user.avatar_url === "string" ? user.avatar_url : null,
    profileUrl: typeof user.html_url === "string" ? user.html_url : null,
    bio: typeof user.bio === "string" ? user.bio : null,
    publicRepos: typeof user.public_repos === "number" ? user.public_repos : null,
    followers: typeof user.followers === "number" ? user.followers : null,
    following: typeof user.following === "number" ? user.following : null,
  };
}

async function loadGoogleProfile(accessToken: string): Promise<ProfileUser | null> {
  const user = await apiRequest(googleUserInfoURL, accessToken);

  if (
    typeof user !== "object" ||
    user === null ||
    typeof user.sub !== "string"
  ) {
    return null;
  }

  const email = typeof user.email === "string" ? user.email : null;

  return {
    provider: "google",
    id: user.sub,
    name: typeof user.name === "string" ? user.name : null,
    handle: email ?? user.sub,
    email,
    avatarUrl: typeof user.picture === "string" ? user.picture : null,
    profileUrl: email ? `mailto:${email}` : null,
    bio: null,
    publicRepos: null,
    followers: null,
    following: null,
  };
}
