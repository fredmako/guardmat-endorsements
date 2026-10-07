"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QRCode from "@/components/QRCode";
import { SOCIAL_SHARE_URL } from "@/lib/constants";

export default function QRCodePage() {
  const [schoolSlug, setSchoolSlug] = useState("");
  const [qrValue, setQrValue] = useState(SOCIAL_SHARE_URL);

  function generateQR() {
    if (schoolSlug.trim()) {
      setQrValue(`${SOCIAL_SHARE_URL}/endorse/${schoolSlug.trim()}`);
    } else {
      setQrValue(SOCIAL_SHARE_URL);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
            <p className="text-gray-600">Generate QR codes for schools and the campaign</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Slug (optional)
                </label>
                <input
                  type="text"
                  value={schoolSlug}
                  onChange={(e) => setSchoolSlug(e.target.value)}
                  placeholder="e.g. kisii-primary"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for the main campaign QR code
                </p>
              </div>
              <button
                onClick={generateQR}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Generate QR Code
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <QRCode value={qrValue} size={250} />
              <p className="mt-4 text-sm text-gray-600 text-center break-all">
                {qrValue}
              </p>
              <button
                onClick={() => {
                  const canvas = document.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = "guardmat-qr-code.png";
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
