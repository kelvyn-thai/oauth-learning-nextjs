import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getActiveProvider } from "@/lib/session";

type HomeProps = {
  isLoggedIn: boolean;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  const keycloakSession = await getServerSession(req, res, authOptions);

  return {
    props: {
      isLoggedIn: getActiveProvider(req.cookies, keycloakSession) !== null,
    },
  };
};

export default function Home({ isLoggedIn }: HomeProps) {
  if (isLoggedIn) {
    return (
      <main className="p-8 font-sans">
        <h3 className="text-xl font-semibold">Logged In</h3>
        <p className="mt-3">
          <Link className="underline" href="/profile">
            Profile
          </Link>
        </p>
        <div className="mt-2">
          <form action="/api/logout" method="post">
            <button type="submit" className="underline">
              Log Out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 font-sans">
      <h3 className="text-xl font-semibold">Not logged in</h3>
      <p className="mt-3">
        <a className="underline" href="/login">
          Log In
        </a>
      </p>
    </main>
  );
}
