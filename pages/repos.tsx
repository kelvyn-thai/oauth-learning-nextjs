import type { GetServerSideProps } from "next";
import {
  ACCESS_TOKEN_COOKIE,
  apiRequest,
  apiURLBase,
} from "@/lib/github";

type GitHubRepo = {
  name: string;
  html_url: string;
};

type ReposProps = {
  repos: GitHubRepo[];
};

export const getServerSideProps: GetServerSideProps<ReposProps> = async ({
  req,
}) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];

  if (!accessToken) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const repos = await apiRequest(
    `${apiURLBase}user/repos?${new URLSearchParams({
      sort: "created",
      direction: "desc",
    })}`,
    accessToken,
  );

  return {
    props: {
      repos: Array.isArray(repos) ? repos : [],
    },
  };
};

export default function ReposPage({ repos }: ReposProps) {
  return (
    <main className="p-8 font-sans">
      <ul className="list-disc pl-6">
        {repos.map((repo) => (
          <li key={repo.html_url}>
            <a className="underline" href={repo.html_url}>
              {repo.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
