# OAuth2 Login Diagram Handoff

## Diagram Goal

- Audience: engineer / learning
- Main message: Pages Router app runs authorization-code + PKCE against GitHub or Google, then stores an HttpOnly session cookie
- Requested output: Mermaid sequence (source) + diagram-design HTML (render)
- Suggested diagram type: Sequence
- Size or destination: `doc-wide` · `diagrams/oauth2-auth-code.html`

## Scope

- App: `oauth-learning-nextjs` Pages Router
- Frontend/Dashboard: `/`, `/login`, `/profile`, `/repos`
- Backend: same Next.js process (`getServerSideProps` + `/api/logout`)
- Database: none
- External systems: GitHub OAuth + Google OAuth (drawn as one Auth Server role)
- Out of scope: logout, `/repos`, error query-string redirects, token refresh

## Evidence

| Label | Element | Relationship / behavior | Evidence | Confidence |
| --- | --- | --- | --- | --- |
| Actor | Browser | Follows 302s; holds cookies | `pages/login/github.tsx` | [FACT] |
| Actor | Next.js | Mints PKCE, exchanges code, sets session | `pages/login/github.tsx`, `pages/auth/github/callback.tsx`, `pages/auth/google/callback.tsx` | [FACT] |
| Actor | Auth Server | GitHub + Google same grant role | user merge + `lib/github.ts` + `lib/google.ts` | [INFERENCE] |
| API | `GET /login/{p}` | Clear old cookies; set `state`, `nonce`, `code_verifier`; 302 authorize | `pages/login/github.tsx:21`, `pages/login/google.tsx:21` | [FACT] |
| API | `GET authorize` | `response_type=code`, PKCE S256, `state`, `nonce` | `lib/github.ts:71`, `lib/google.ts:18` | [FACT] |
| API | `POST token` | `grant_type=authorization_code` + `code_verifier` + client secret | `pages/auth/github/callback.tsx:66`, `pages/auth/google/callback.tsx:61` | [FACT] |
| API | `GET /profile` | Load user from provider API using session cookie | `pages/profile.tsx:9`, `lib/session.ts:38` | [FACT] |
| State | GitHub session | Cookie `access_token` | `pages/auth/github/callback.tsx:84` | [FACT] |
| State | Google session | Cookies `google_access_token`, `google_user_id`, `google_email` | `pages/auth/google/callback.tsx:94` | [FACT] |
| Guard | GitHub nonce | Cookie nonce vs `state.nonce` **before** token | `pages/auth/github/callback.tsx:39` | [FACT] |
| Guard | Google nonce | Cookie nonce vs `id_token.nonce` **after** token | `pages/auth/google/callback.tsx:85` | [FACT] |
| Entity | Refresh token | Not stored or used | no refresh path in repo | [UNKNOWN] |

## Sequence / Flow Facts

1. [FACT] User picks GitHub or Google at `/login`.
2. [FACT] Login GSSP mints `state`, `nonce`, PKCE verifier/challenge, writes HttpOnly cookies, 302s to the provider authorize URL.
3. [FACT] Provider returns `code` + `state` to `/auth/{github\|google}/callback`.
4. [FACT] Callback rejects mismatched `state`.
5. [FACT] Callback POSTs token with `code_verifier`.
6. [FACT] Success 302s to `/profile` with provider session cookies; PKCE cookies cleared.
7. [INFERENCE] One Auth Server lifeline is enough for the grant. Cookie names and nonce timing still differ.
8. [UNKNOWN] Registered redirect URIs, client IDs, and whether GitHub honors `nonce` as OIDC.

## Entity / Database Facts

- [FACT] No database. Session = cookies only.
- [UNKNOWN] Cookie max-age (unset → session cookie).

## State / Lifecycle Facts

- [FACT] Logged-out: no GitHub `access_token` and no Google token+user-id pair (`lib/session.ts:26`).
- [FACT] GitHub cookie wins if both present (`getActiveProvider` checks GitHub first).
- [FACT] Logout POST expires all provider cookies (`pages/api/logout.ts`).

## Open Questions

- [ ] Draw nonce as one merged note, or split GitHub vs Google in a second detail sequence?
- [ ] Include `/profile` userinfo fetch in this diagram or keep grant-only?

## Routing

- Source: Mermaid `sequenceDiagram`
- Render: diagram-design Sequence · no semantic pattern · `doc-wide` · default skin
- Cuts: `/`, login picker, logout, `/repos`, error redirects, userinfo
