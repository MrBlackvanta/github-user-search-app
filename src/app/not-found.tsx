import { ErrorPanel } from "@/components/layout";
import { SITE_NAME } from "@/data";
import type { Metadata } from "next";
import Link from "next/link";

const description =
  "There’s no profile at this address. Head back to the search to look up any GitHub user by username.";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Page not found`,
  description,
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <ErrorPanel title="Page not found" description={description}>
      <Link href="/" className="v-button">
        Back to search
      </Link>
    </ErrorPanel>
  );
}
