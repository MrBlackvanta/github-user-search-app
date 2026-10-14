import { Signature } from "@/components/layout";
import { SITE_URL } from "@/data";
import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const name = "devfinder";
const title = `${name} | GitHub profile search`;
const description =
  "Look up any GitHub user by username and see their profile at a glance: bio, repos, followers, location and links, in light or dark.";

const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "The devfinder search bar above the Octocat's GitHub profile card.",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: name,
    locale: "en_US",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#141d2f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} antialiased`}>
      <body className="relative flex min-h-dvh flex-col">
        {children}
        <Signature />
      </body>
    </html>
  );
}
