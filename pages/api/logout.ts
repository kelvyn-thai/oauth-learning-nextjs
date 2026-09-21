import type { NextApiRequest, NextApiResponse } from "next";
import {
  GOOGLE_ACCESS_TOKEN_COOKIE,
  GOOGLE_EMAIL_COOKIE,
  GOOGLE_USER_ID_COOKIE,
} from "@/lib/google";
import { ACCESS_TOKEN_COOKIE, serializeSessionCookie } from "@/lib/github";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  for (const name of [
    ACCESS_TOKEN_COOKIE,
    GOOGLE_ACCESS_TOKEN_COOKIE,
    GOOGLE_USER_ID_COOKIE,
    GOOGLE_EMAIL_COOKIE,
  ]) {
    res.appendHeader(
      "Set-Cookie",
      serializeSessionCookie(name, "", { maxAge: 0 }),
    );
  }

  res.redirect(303, "/");
}
