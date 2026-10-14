import { SearchIcon } from "@/components/icons";
import type { SearchFailure } from "@/lib/github";
import { useId, useState, type SubmitEventHandler } from "react";

const FAILURE_MESSAGES: Record<SearchFailure, string> = {
  "not-found": "No results",
  unavailable: "Try later",
};

type ShownFailure = { failure: SearchFailure; key: number };

type SearchFormProps = {
  failure: SearchFailure | null;
  failureKey: number;
  pending: boolean;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  onQueryChange: () => void;
};

export default function SearchForm({
  failure,
  failureKey,
  pending,
  onSubmit,
  onQueryChange,
}: SearchFormProps) {
  const inputId = useId();
  const failureId = useId();
  const [shown, setShown] = useState<ShownFailure | null>(null);

  if (failure && shown?.key !== failureKey) {
    setShown({ failure, key: failureKey });
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="v-search-bar bg-card rounded-card shadow-card mb-4 flex min-h-15 items-center pe-1.75 md:mb-6 md:min-h-17.25 md:pe-2.5 dark:shadow-none"
    >
      <label
        htmlFor={inputId}
        className="flex cursor-text items-center self-stretch ps-4 pe-2 md:ps-8 md:pe-5.75"
      >
        <SearchIcon className="text-accent h-5 w-auto md:h-6" />
        <span className="sr-only">GitHub username</span>
      </label>
      <input
        id={inputId}
        name="username"
        type="text"
        placeholder="Search GitHub username…"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-invalid={failure ? true : undefined}
        aria-describedby={failure ? failureId : undefined}
        onChange={onQueryChange}
        className="text-ink-strong placeholder:text-muted caret-accent text-label md:text-field me-3 min-w-0 flex-1 self-stretch bg-transparent focus-visible:outline-transparent md:me-6"
      />
      {shown && (
        <p
          key={shown.key}
          id={failureId}
          role="alert"
          hidden={!failure}
          className="v-reveal text-danger text-label md:text-body me-3 shrink-0 font-bold md:me-6"
        >
          {FAILURE_MESSAGES[shown.failure]}
        </p>
      )}
      <button type="submit" className="v-button relative shrink-0">
        <span
          className={`transition-opacity ${pending ? "opacity-0 delay-150" : ""}`}
        >
          Search
        </span>
        {pending && (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center transition-opacity delay-150 starting:opacity-0"
          >
            <span className="size-4.5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-pulse md:size-5" />
          </span>
        )}
      </button>
    </form>
  );
}
