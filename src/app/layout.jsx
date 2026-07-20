import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CMSProvider } from "@/context/CMSContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";

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

import { db } from "@/services/db";

export async function generateMetadata() {
  let settings = null;
  try {
    settings = await db.getSettings();
  } catch {
    // silently fall back to defaults
  }

  const title = settings?.seoTitle || settings?.websiteTitle || "Shree Labriya Jain Shwetambar Mandir | Chaturmas Festival 2026";
  const description = settings?.seoDescription || "Welcome to the official portal of Shree Labriya Jain Shwetambar Mandir for Chaturmas 2026. Explore daily pravachans, Panchang timings, community announcements, donation channels, and spiritual events.";
  const heroBanner = settings?.heroBanner || "/jain_hero_spiritual.png";
  const templeName = settings?.templeName || "Shree Labriya Jain Shwetambar Mandir";

  return {
    metadataBase: new URL("https://labriyachaturmasin.vercel.app"),
    title,
    description,
    keywords: ["Jain Mandir", "Labriya", "Chaturmas", "Jainism", "Pravachan", "Panchang", "Jai Jinendra", "Aarti Schedule", templeName],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: heroBanner.startsWith("data:") ? "/jain_hero_spiritual.png" : heroBanner,
          width: 1200,
          height: 630,
          alt: `${templeName} Chaturmas`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroBanner.startsWith("data:") ? "/jain_hero_spiritual.png" : heroBanner],
    },
  };
}


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased font-sans bg-bg-custom text-text-primary transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <CMSProvider>
          <AuthProvider>
            <MaintenanceWrapper>
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </MaintenanceWrapper>
          </AuthProvider>
        </CMSProvider>
      </body>
    </html>
  );
}
