import type { GetServerSideProps } from "next";
import {
  GOOGLE_ACCESS_TOKEN_COOKIE,
  GOOGLE_EMAIL_COOKIE,
  GOOGLE_USER_ID_COOKIE,
  buildGoogleRedirectURI,
  googleClientID,
  googleClientSecret,
  googleTokenURL,
  parseIdTokenPayload,
} from "@/lib/google";
import {
  CODE_VERIFIER_COOKIE,
  NONCE_COOKIE,
  STATE_COOKIE,
  apiRequest,
  firstQueryValue,
  getRequestOrigin,
  serializeSessionCookie,
} from "@/lib/github";

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
}) => {
  const origin = getRequestOrigin(req);
  const code = firstQueryValue(query.code);
  const state = firstQueryValue(query.state);
  const savedState = req.cookies[STATE_COOKIE];
  const savedNonce = req.cookies[NONCE_COOKIE];
  const codeVerifier = req.cookies[CODE_VERIFIER_COOKIE];

  if (!savedState || savedState !== state) {
    return {
      redirect: {
        destination: "/?error=invalid_state",
        permanent: false,
      },
    };
  }

  if (!code) {
    return {
      redirect: {
        destination: "/?error=invalid_code",
        permanent: false,
      },
    };
  }

  if (!codeVerifier) {
    return {
      redirect: {
        destination: "/?error=invalid_pkce",
        permanent: false,
      },
    };
  }

  // exchange code to get JWT token
  const token = (await apiRequest(googleTokenURL, undefined, {
    grant_type: "authorization_code",
    client_id: googleClientID,
    client_secret: googleClientSecret,
    redirect_uri: buildGoogleRedirectURI(origin),
    code,
    code_verifier: codeVerifier,
  })) as { access_token?: string; id_token?: string };

  console.log({ token });

  const idToken = token.id_token ? parseIdTokenPayload(token.id_token) : null;

  console.log({ idToken });

  if (!token.access_token || !idToken?.sub) {
    return {
      redirect: {
        destination: "/?error=token_exchange",
        permanent: false,
      },
    };
  }

  if (!savedNonce || idToken.nonce !== savedNonce) {
    return {
      redirect: {
        destination: "/?error=invalid_nonce",
        permanent: false,
      },
    };
  }

  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_ACCESS_TOKEN_COOKIE, token.access_token),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_USER_ID_COOKIE, idToken.sub),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(GOOGLE_EMAIL_COOKIE, idToken.email ?? ""),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(CODE_VERIFIER_COOKIE, "", { maxAge: 0 }),
  );
  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(NONCE_COOKIE, "", { maxAge: 0 }),
  );

  return {
    redirect: {
      destination: "/profile",
      permanent: false,
    },
  };
};

export default function GoogleCallbackPage() {
  return null;
}
