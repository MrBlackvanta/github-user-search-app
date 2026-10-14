"use client";

import {
  fetchProfile,
  toUsername,
  type Profile,
  type SearchFailure,
} from "@/lib/github";
import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import ProfileCard from "./profile-card";
import SearchForm from "./search-form";

type SearchState = {
  profile: Profile;
  failure: SearchFailure | null;
  attempt: number;
};

type SearchRequest = { username: string; signal: AbortSignal };

async function search(
  previous: SearchState,
  { username, signal }: SearchRequest,
): Promise<SearchState> {
  const result = await fetchProfile(username, signal);
  if (signal.aborted) return previous;

  const attempt = previous.attempt + 1;
  return result.status === "found"
    ? { profile: result.profile, failure: null, attempt }
    : { profile: previous.profile, failure: result.status, attempt };
}

type UserSearchProps = { initialProfile: Profile };

export default function UserSearch({ initialProfile }: UserSearchProps) {
  const [state, dispatch, isPending] = useActionState(search, {
    profile: initialProfile,
    failure: null,
    attempt: 0,
  });
  const [dismissedAttempt, setDismissedAttempt] = useState(0);
  const latestRequest = useRef<AbortController>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("username");
    const username = toUsername(String(query ?? ""));
    if (!username) return;

    latestRequest.current?.abort();
    const request = new AbortController();
    latestRequest.current = request;
    startTransition(() => dispatch({ username, signal: request.signal }));
  }

  const failure = dismissedAttempt === state.attempt ? null : state.failure;
  const found = state.attempt > 0 && !state.failure;

  return (
    <>
      <SearchForm
        failure={failure}
        failureKey={state.attempt}
        pending={isPending}
        onSubmit={handleSubmit}
        onQueryChange={() => setDismissedAttempt(state.attempt)}
      />
      <p role="status" className="sr-only">
        {found && <span key={state.attempt}>Found {state.profile.name}</span>}
      </p>
      <ProfileCard profile={state.profile} busy={isPending} />
    </>
  );
}
