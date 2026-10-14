import type { ReactNode } from "react";
import SiteHeader from "./site-header";

type ErrorPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function ErrorPanel({
  title,
  description,
  children,
}: ErrorPanelProps) {
  return (
    <>
      <SiteHeader />
      <main className="bg-card rounded-card shadow-card px-6 pt-8 pb-12 md:p-10 lg:p-12 dark:shadow-none">
        <h1 className="text-ink md:text-title font-bold">{title}</h1>
        <p className="text-muted text-label/6.25 md:text-body mt-4 mb-8 md:mt-6">
          {description}
        </p>
        {children}
      </main>
    </>
  );
}
