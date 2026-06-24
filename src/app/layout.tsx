import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TampKemail | Free Temporary Email - Disposable Temp Mail",
    template: "%s | TampKemail",
  },
  description:
    "Create free temporary email addresses instantly. Protect your privacy from spam with disposable email. No registration required. Multiple domains available. Try free now!",
  keywords: [
    "temporary email",
    "temp mail",
    "disposable email",
    "fake email",
    "throwaway email",
    "free temp email",
    "temporary gmail",
    "burner email",
    "anonymous email",
    "privacy email",
    "spam protection",
    "email verification",
    "TampKemail",
  ],
  authors: [{ name: "TampKemail" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📧</text></svg>",
  },
  metadataBase: new URL("https://tampkemail.pages.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TampKemail | Free Temporary Email - Disposable Temp Mail",
    description:
      "Create free temporary email addresses instantly. Protect your privacy from spam with disposable email. No registration required.",
              url: "https://tampkemail.pages.dev",
    siteName: "TampKemail",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TampKemail | Free Temporary Email",
    description:
      "Create free temporary email addresses instantly. Protect your privacy from spam with disposable email.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#059669" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TampKemail",
    url: "https://tampkemail.pages.dev",
              description:
                "Free temporary email service. Create disposable email addresses instantly without registration.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
