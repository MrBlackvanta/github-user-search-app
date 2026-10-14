import { Signature } from "@/components/layout";
import { SITE_NAME, SITE_URL } from "@/data";
import { applyStoredTheme } from "@/lib/theme";
import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const title = `${SITE_NAME} | GitHub profile search`;
const description =
  "Look up any GitHub user by username and see their profile at a glance: bio, repos, followers, location and links, in light or dark.";

const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "devfinder, GitHub profile search: the dark theme's search bar above Abdelrhman Abdelaal's profile card.",
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
    siteName: SITE_NAME,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} antialiased`}>
      <body className="relative min-h-dvh px-6 pt-8 pb-20 md:pt-35 lg:pt-36">
        <script dangerouslySetInnerHTML={{ __html: applyStoredTheme }} />
        <div className="mx-auto max-w-xl lg:max-w-182.5">{children}</div>
        <Signature />
      </body>
    </html>
  );
}
