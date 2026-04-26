import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueOrigin | Verify Authentic Products",
  description: "Secure, blockchain-inspired product verification and anti-counterfeit platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <Providers>
          <Navbar />
          <main className="app-container">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
