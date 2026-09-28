"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react";
import type { ProfileUser } from "@/lib/session";

export default function ProfilePage() {
  const { data: session, status } = useSession()
  console.log(session, status)
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [error, setError] = useState<"unauthenticated" | "failed" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/profile");

        if (response.status === 401) {
          if (!cancelled) {
            setError("unauthenticated");
          }
          return;
        }

        if (!response.ok) {
          if (!cancelled) {
            setError("failed");
          }
          return;
        }

        const data = (await response.json()) as ProfileUser;

        if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          setError("failed");
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error === "unauthenticated") {
    return (
      <main className="p-8 font-sans">
        <p>Not logged in.</p>
        <p className="mt-2">
          <a className="underline" href="/login">
            Log In
          </a>
        </p>
      </main>
    );
  }

  if (error === "failed") {
    return (
      <main className="p-8 font-sans">
        <p>Failed to load profile.</p>
      </main>
    );
  }

  if (user === null) {
    return (
      <main className="p-8 font-sans">
        <p>Loading...</p>
      </main>
    );
  }

  const providerLabel =
    user.provider === "github"
      ? "GitHub"
      : user.provider === "google"
        ? "Google"
        : "Keycloak";

  return (
    <main className="p-8 font-sans">
      <h3 className="text-xl font-semibold">Profile</h3>
      <p className="mt-1">Signed in with {providerLabel}</p>
      <div className="mt-4 flex gap-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.handle}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full"
          />
        ) : null}
        <div>
          <p className="text-lg font-semibold">{user.name ?? user.handle}</p>
          <p>
            {user.profileUrl ? (
              <a className="underline" href={user.profileUrl}>
                {user.handle}
              </a>
            ) : (
              user.handle
            )}
          </p>
          {user.email ? <p className="mt-1">{user.email}</p> : null}
          {user.bio ? <p className="mt-2">{user.bio}</p> : null}
          {user.publicRepos !== null ? (
            <p className="mt-2">
              {user.publicRepos} repos · {user.followers} followers ·{" "}
              {user.following} following
            </p>
          ) : null}
        </div>
      </div>
      {user.provider === "github" ? (
        <p className="mt-6">
          <Link className="underline" href="/repos">
            View Repos
          </Link>
        </p>
      ) : null}
      <p className="mt-2">
        <Link className="underline" href="/">
          Home
        </Link>
      </p>
    </main>
  );
}
