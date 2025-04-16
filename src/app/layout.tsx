import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Open_Sans, Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FontProvider } from "@/contexts/FontContext";
import { PdfProvider } from "@/contexts/PdfContext";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

// Load local fonts
const openDyslexic = localFont({
  src: [
    {
      path: "../../public/fonts/OpenDyslexic-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/OpenDyslexic-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-open-dyslexic",
});

const verdana = localFont({
  src: [
    {
      path: "../../public/fonts/Verdana-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/Verdana-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-verdana",
});

export const metadata: Metadata = {
  title: "Dyslexia",
  description: "A tool to help with dyslexia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${atkinson.variable} ${roboto.variable} ${openDyslexic.variable} ${verdana.variable} font-atkinson`}
        style={
          {
            "--font-atkinson": atkinson.style.fontFamily,
            "--font-roboto": roboto.style.fontFamily,
            "--font-open-dyslexic": openDyslexic.style.fontFamily,
            "--font-verdana": verdana.style.fontFamily,
            fontSize: "calc(1rem * var(--user-font-scale))",
          } as React.CSSProperties
        }
      >
        <FontProvider>
          <PdfProvider>
            <Navbar />
            {children}
          </PdfProvider>
        </FontProvider>
      </body>
    </html>
  );
}
