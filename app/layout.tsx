import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizGPT - AI-Powered Quiz Platform",
  description: "Test your knowledge with AI-generated quizzes on any topic",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
        >
          <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
            {children}
          </main>
          <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center text-sm">
              © {new Date().getFullYear()} QuizGPT. All rights reserved.
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
