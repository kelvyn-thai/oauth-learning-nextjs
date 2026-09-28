import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="p-8 font-sans">
      <h3 className="text-xl font-semibold">Log In</h3>
      <p className="mt-3">
        <a className="underline" href="/login/github">
          GitHub
        </a>
      </p>
      <p className="mt-2">
        <a className="underline" href="/login/google">
          Google
        </a>
      </p>
      <p className="mt-2">
        <button
          className="underline"
          onClick={() =>
            signIn(
              "keycloak",
              { callbackUrl: "/profile" },
              { kc_idp_hint: "google-test" },
            )
          }
        >
          Keycloak (Google SSO)
        </button>
      </p>
      <p className="mt-2">
        <button
          className="underline"
          onClick={() =>
            signIn(
              "keycloak",
              { callbackUrl: "/profile" },
              { kc_idp_hint: "saml-test" },
            )
          }
        >
          Keycloak (SAML test)
        </button>
      </p>
    </main>
  );
}
