import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReplacedBy.md — Will AI Replace Your Job?",
  description:
    "Find out if AI can replace your job. Paste your LinkedIn URL and get a brutally honest AI replacement score, cause of death, and retirement certificate.",
  keywords: [
    "will AI replace my job",
    "AI job replacement",
    "am I replaceable by AI",
    "AI automation score",
    "LinkedIn AI analysis",
    "will AI take my job",
    "job automation risk",
  ],
  openGraph: {
    title: "ReplacedBy.md — Will AI Replace Your Job?",
    description:
      "Paste your LinkedIn URL. Get your AI replacement score, cause of death, and retirement certificate. Try not to cry.",
    type: "website",
    url: "https://www.replacedby.md",
    siteName: "ReplacedBy.md",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReplacedBy.md — Will AI Replace Your Job?",
    description:
      "Paste your LinkedIn URL. Get your AI replacement score, cause of death, and retirement certificate.",
  },
  alternates: {
    canonical: "https://www.replacedby.md",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-P9QWH0378K" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-P9QWH0378K');`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <script src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              kofiWidgetOverlay.draw('sunilmikkilineni', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Support .MD',
                'floating-chat.donateButton.background-color': '#00b9fe',
                'floating-chat.donateButton.text-color': '#fff'
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
