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
  title: "ReplacedBy.md — Are you just a system prompt?",
  description:
    "Paste your LinkedIn URL. Find out if you can be replaced by AI. Try not to cry.",
  openGraph: {
    title: "ReplacedBy.md",
    description: "Find out how replaceable you are by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="antialiased">
        {children}
        <script src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              kofiWidgetOverlay.draw('sunilmikkilineni', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Support me,This costs real $',
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
