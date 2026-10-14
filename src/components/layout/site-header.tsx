import ThemeToggle from "./theme-toggle";

type SiteHeaderProps = {
  logoAs?: "h1" | "p";
};

export default function SiteHeader({ logoAs: Logo = "p" }: SiteHeaderProps) {
  return (
    <header className="mb-9 flex items-center justify-between">
      <Logo className="text-title text-ink-strong font-bold">devfinder</Logo>
      <ThemeToggle />
    </header>
  );
}
