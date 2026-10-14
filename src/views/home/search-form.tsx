import { SearchIcon } from "@/components/icons";
import type { SearchFailure } from "@/lib/github";
import { useId, type SubmitEventHandler } from "react";

const FAILURE_MESSAGES: Record<SearchFailure, string> = {
  "not-found": "No results",
  unavailable: "Try later",
};

type SearchFormProps = {
  failure: SearchFailure | null;
  failureKey: number;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  onQueryChange: () => void;
};

export default function SearchForm({
  failure,
  failureKey,
  onSubmit,
  onQueryChange,
}: SearchFormProps) {
  const inputId = useId();
  const failureId = useId();

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
      {failure && (
        <p
          key={failureKey}
          id={failureId}
          role="alert"
          className="text-danger text-label md:text-body me-3 shrink-0 font-bold md:me-6"
        >
          {FAILURE_MESSAGES[failure]}
        </p>
      )}
      <button
        type="submit"
        className="bg-accent hover:bg-accent-hover rounded-inner h-11.5 shrink-0 px-4 text-sm font-bold text-white transition-[background-color] ease-out md:h-12.5 md:px-6 md:text-base"
      >
        Search
      </button>
    </form>
  );
}
