"use client";

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Error - Guardmat Endorsements",
};

export default function ErrorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
