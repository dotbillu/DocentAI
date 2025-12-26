import type { Metadata } from "next";
import { Rasa, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import "./globals.css";
import { Provider as JotaiProvider } from "jotai";
import SessionProvider from "../components/providers/SessionProvider";
import ThemeManager from "../components/providers/ThemeManager";

const rasa = Rasa({
  subsets: ["latin"],
  variable: "--font-rasa",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Docent AI",
  description: "Master any documentation instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rasa.variable} ${inter.variable} ${jetbrains.variable} font-sans antialiased text-titanium-100 flex flex-col h-screen overflow-hidden bg-linear-to-br from-titanium-950 via-[#020617] to-black`}
      >
        <div className="fixed inset-0 -z-50 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60vh] bg-(--accent-color)/10 blur-[120px] rounded-full mix-blend-screen transition-colors duration-700"></div>
        </div>

        <SessionProvider>
          <JotaiProvider>
            <ThemeManager />
            <Navbar />
            {children}
          </JotaiProvider>
        </SessionProvider>
      </body>
    </html>
  );
}