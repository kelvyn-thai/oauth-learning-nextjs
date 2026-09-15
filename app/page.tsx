import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/oauth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;

  // Start the login process by sending the user to GitHub's authorization page
  if (action === "login") {
    redirect("/login");
  }

  // If there is an access token in the session, the user is already logged in
  if (!action) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      return (
        <main className="p-8 font-sans">
          <h3 className="text-xl font-semibold">Logged In</h3>
          <p className="mt-3">
            <Link className="underline" href="/?action=repos">
              View Repos
            </Link>
          </p>
          <p className="mt-2">
            <Link className="underline" href="/?action=logout">
              Log Out
            </Link>
          </p>
        </main>
      );
    }

    return (
      <main className="p-8 font-sans">
        <h3 className="text-xl font-semibold">Not logged in</h3>
        <p className="mt-3">
          <Link className="underline" href="/?action=login">
            Log In
          </Link>
        </p>
      </main>
    );
  }

  return null;
}
