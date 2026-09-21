import type { GetServerSideProps } from "next";
import {
  ACCESS_TOKEN_COOKIE,
  CODE_VERIFIER_COOKIE,
  NONCE_COOKIE,
  STATE_COOKIE,
  apiRequest,
  buildRedirectURI,
  firstQueryValue,
  getRequestOrigin,
  githubClientID,
  githubClientSecret,
  serializeSessionCookie,
  splitStateNonce,
  tokenURL,
} from "@/lib/github";

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
}) => {
  const origin = getRequestOrigin(req);
  const code = firstQueryValue(query.code);
  const { state, nonce } = splitStateNonce(firstQueryValue(query.state));
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

  if (!savedNonce || savedNonce !== nonce) {
    return {
      redirect: {
        destination: "/?error=invalid_nonce",
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

  // exchange code to get JWT Token
  const token = (await apiRequest(tokenURL, undefined, {
    grant_type: "authorization_code",
    client_id: githubClientID,
    client_secret: githubClientSecret,
    redirect_uri: buildRedirectURI(origin),
    code,
    code_verifier: codeVerifier,
  })) as { access_token?: string };

  if (!token.access_token) {
    return {
      redirect: {
        destination: "/?error=token_exchange",
        permanent: false,
      },
    };
  }

  res.appendHeader(
    "Set-Cookie",
    serializeSessionCookie(ACCESS_TOKEN_COOKIE, token.access_token),
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

export default function GitHubCallbackPage() {
  return null;
}
