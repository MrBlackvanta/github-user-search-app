"use client";

import { ErrorPanel } from "@/components/layout";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ reset }: RootErrorProps) {
  return (
    <ErrorPanel
      title="Something went wrong"
      description="That profile couldn’t be shown. Try again to start a fresh search."
    >
      <button type="button" onClick={reset} className="v-button">
        Try again
      </button>
    </ErrorPanel>
  );
}
