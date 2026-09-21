import type { GetServerSideProps } from "next";
import {
  GOOGLE_ACCESS_TOKEN_COOKIE,
  GOOGLE_EMAIL_COOKIE,
  GOOGLE_USER_ID_COOKIE,
  buildGoogleAuthorizationURL,
} from "@/lib/google";
import {
  ACCESS_TOKEN_COOKIE,
  CODE_VERIFIER_COOKIE,
  NONCE_COOKIE,
  STATE_COOKIE,
  createCodeChallenge,
  createCodeVerifier,
  createOAuthNonce,
  createOAuthState,
  getRequestOrigin,
  serializeSessionCookie,
} from "@/lib/github";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const state = createOAuthState();
  const nonce = createOAuthNonce();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const origin = getRequestOrigin(req);
  const authorizationURL = buildGoogleAuthorizationURL(
    origin,
    state,
    codeChallenge,
    nonce,
  );

  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(ACCESS_TOKEN_COOKIE, "", { maxAge: 0 }),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_ACCESS_TOKEN_COOKIE, "", { maxAge: 0 }),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_USER_ID_COOKIE, "", { maxAge: 0 }),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_EMAIL_COOKIE, "", { maxAge: 0 }),
  );
  res.appendHeader("Set-Cookie", serializeSessionCookie(STATE_COOKIE, state));
  res.appendHeader("Set-Cookie", serializeSessionCookie(NONCE_COOKIE, nonce));
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(CODE_VERIFIER_COOKIE, codeVerifier),
  );

  return {
    redirect: {
      destination: authorizationURL,
      permanent: false,
    },
  };
};

export default function GoogleLoginPage() {
  return null;
}
