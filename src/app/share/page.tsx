"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialShare from "@/components/SocialShare";
import { SOCIAL_SHARE_URL, SOCIAL_SHARE_TEXT } from "@/lib/constants";

export default function SharePage() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(SOCIAL_SHARE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share the Initiative</h1>
            <p className="text-gray-600">Help us reach more people by sharing</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-800 font-medium italic">
                &ldquo;{SOCIAL_SHARE_TEXT}&rdquo;
              </p>
            </div>

            <div className="mb-6">
              <SocialShare />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={SOCIAL_SHARE_URL}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
