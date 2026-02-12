import type { Metadata } from "next";
import "./globals.css";
import { NavbarProvider } from "@/components/navbar-provider";
import { ConditionalBackground } from "@/components/conditional-background";
import { WebsiteArticlesProvider } from "@/contexts/website-articles-context";
import { HtmlLangHandler } from "@/components/html-lang-handler";
import { GoogleAnalytics } from "@/components/google-analytics";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Galatide - Ocean Mysteries",
  description:
    "Explore the mysterious connection between deep space and the ocean depths. Discover stories that blur the boundaries between cosmic wonder and aquatic horror.",
  keywords: [
    "ocean mysteries",
    "deep sea exploration",
    "space ocean connection",
    "sci-fi stories",
    "marine biology",
    "astrophysics",
  ],
  authors: [{ name: "Galatide Team" }],
  creator: "Galatide",
  publisher: "Galatide",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://galatide.com"),
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Galatide - Ocean Mysteries",
    description:
      "Explore the mysterious connection between deep space and the ocean depths. Discover stories that blur the boundaries between cosmic wonder and aquatic horror.",
    url: "https://galatide.com",
    siteName: "Galatide",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Galatide - Ocean Mysteries",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galatide - Ocean Mysteries",
    description: "Explore the mysterious connection between deep space and the ocean depths.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#0a192f" />
        <meta name="msapplication-TileColor" content="#0a192f" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
        <GoogleAnalytics />
      </head>
      <body className="antialiased font-body">
        <HtmlLangHandler />
        <NavbarProvider>
          <WebsiteArticlesProvider>
            <ConditionalBackground />
            <div className="relative z-10">{children}</div>
            <Toaster />
          </WebsiteArticlesProvider>
        </NavbarProvider>
      </body>
    </html>
  );
}
