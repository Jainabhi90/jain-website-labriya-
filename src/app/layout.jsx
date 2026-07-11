import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://labriyachaturmasin.vercel.app"),
  title: "Shree Labriya Jain Shwetambar Mandir | Chaturmas Festival 2026",
  description: "Welcome to the official portal of Shree Labriya Jain Shwetambar Mandir for Chaturmas 2026. Explore daily pravachans, Panchang timings, community announcements, donation channels, and spiritual events.",
  keywords: ["Jain Mandir", "Labriya", "Chaturmas 2026", "Jainism", "Pravachan", "Panchang", "Jai Jinendra", "Aarti Schedule"],
  openGraph: {
    title: "Shree Labriya Jain Shwetambar Mandir | Chaturmas 2026",
    description: "Connect with the spiritual events, live daily pravachans, and panchang of the Chaturmas 2026 festival at Labriya Jain Mandir.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/jain_hero_spiritual.png",
        width: 1200,
        height: 630,
        alt: "Shree Labriya Jain Mandir Chaturmas 2026",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Labriya Jain Shwetambar Mandir | Chaturmas 2026",
    description: "Connect with the spiritual events, live daily pravachans, and panchang of the Chaturmas 2026 festival at Labriya Jain Mandir.",
    images: ["/jain_hero_spiritual.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased font-sans bg-bg-custom text-text-primary transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
