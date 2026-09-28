import type { NextApiRequest, NextApiResponse } from "next";
import {
  ACCESS_TOKEN_COOKIE,
  apiRequest,
  apiURLBase,
} from "@/lib/github";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];

  if (!accessToken) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  const repos = await apiRequest(
    `${apiURLBase}user/repos?${new URLSearchParams({
      sort: "created",
      direction: "desc",
    })}`,
    accessToken,
  );

  res.status(200).json(Array.isArray(repos) ? repos : []);
}
