export type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  twitter_username?: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

export type ProfileDetail = { text: string; href?: string } | null;

export type Profile = {
  login: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  joinedAt: string;
  bio: string | null;
  repos: number;
  followers: number;
  following: number;
  location: ProfileDetail;
  website: ProfileDetail;
  twitter: ProfileDetail;
  company: ProfileDetail;
};

export type SearchFailure = "not-found" | "unavailable";

export type SearchResult =
  { status: "found"; profile: Profile } | { status: SearchFailure };

const USERS_API = "https://api.github.com/users";
const REQUEST_TIMEOUT = 10_000;
const POSSIBLE_USERNAME = /^[a-z\d-]{1,39}$/i;
const ORG_HANDLE = /^@([a-z\d-]+)$/i;
const HAS_SCHEME = /^https?:\/\//i;

function nonBlank(value: string | null | undefined) {
  return value?.trim() || null;
}

function toLocation(location: string | null): ProfileDetail {
  const text = nonBlank(location);
  return text ? { text } : null;
}

function toWebsite(blog: string | null): ProfileDetail {
  const url = nonBlank(blog);
  if (!url) return null;
  return { text: url, href: HAS_SCHEME.test(url) ? url : `https://${url}` };
}

function toTwitter(username: string | null | undefined): ProfileDetail {
  const handle = nonBlank(username);
  if (!handle) return null;
  return { text: `@${handle}`, href: `https://x.com/${handle}` };
}

function toCompany(company: string | null): ProfileDetail {
  const text = nonBlank(company);
  if (!text) return null;
  const org = ORG_HANDLE.exec(text)?.[1];
  return org ? { text, href: `https://github.com/${org}` } : { text };
}

export function toProfile(user: GitHubUser): Profile {
  return {
    login: user.login,
    name: nonBlank(user.name) ?? user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    joinedAt: user.created_at,
    bio: nonBlank(user.bio),
    repos: user.public_repos,
    followers: user.followers,
    following: user.following,
    location: toLocation(user.location),
    website: toWebsite(user.blog),
    twitter: toTwitter(user.twitter_username),
    company: toCompany(user.company),
  };
}

export function toUsername(query: string) {
  return query.trim().replace(/^@/, "");
}

export async function fetchProfile(
  username: string,
  signal: AbortSignal,
): Promise<SearchResult> {
  if (!POSSIBLE_USERNAME.test(username)) return { status: "not-found" };

  try {
    const response = await fetch(`${USERS_API}/${username}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT)]),
    });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "unavailable" };

    const user: GitHubUser = await response.json();
    return { status: "found", profile: toProfile(user) };
  } catch {
    return { status: "unavailable" };
  }
}
