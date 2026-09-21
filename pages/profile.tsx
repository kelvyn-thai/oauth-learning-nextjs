import type { GetServerSideProps } from "next";
import Link from "next/link";
import { loadProfile, type ProfileUser } from "@/lib/session";
import { useState } from "react";

type ProfileProps = {
  user: ProfileUser;
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({
  req,
}) => {
  const user = await loadProfile(req.cookies);

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: { user } };
};

export default function ProfilePage({ user }: ProfileProps) {
  const providerLabel = user.provider === "github" ? "GitHub" : "Google";
  const [count, setCount] = useState(0);

  return (
    <main className="p-8 font-sans">
      <h3 className="text-xl font-semibold">Profile</h3>
      {count}
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>
        Click
      </button>
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
