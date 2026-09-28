import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { loadProfile } from "@/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const keycloakSession = await getServerSession(req, res, authOptions);
  const user = await loadProfile(req.cookies, keycloakSession);

  if (!user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  res.status(200).json(user);
}
