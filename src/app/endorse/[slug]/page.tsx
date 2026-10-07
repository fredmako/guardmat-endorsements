"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
}

type Step = "form" | "otp" | "success";

export default function SchoolEndorsePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [school, setSchool] = useState<School | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [endorsementId, setEndorsementId] = useState("");
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    fetch("/api/schools")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.schools || []).find((s: School) => s.slug === slug);
        setSchool(found || null);
      })
      .catch(console.error);
  }, [slug]);

  async function sendOtp() {
    setError("");
    if (!parentName || !phone || !consent) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setDevOtp(data.devOtp || "");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndSubmit() {
    setError("");
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "OTP verification failed");

      const submitRes = await fetch("/api/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: school?.id,
          schoolName: school?.name || "",
          parentName,
          phone,
          message,
          consent,
          verified: true,
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || "Submission failed");

      setEndorsementId(submitData.endorsementId);
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!school) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading school...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-3">
              {school.location}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{school.name}</h1>
            <p className="text-gray-600">Endorse this school&apos;s feeding program</p>
          </div>

          {step === "form" && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message of support..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I consent to Guardmat Supermarket Kisii storing my name and phone number for verification purposes.
                    I understand this endorsement represents community support, not official school approval. *
                  </label>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Verify Your Phone</h2>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to {phone}
                </p>
                {devOtp && (
                  <p className="text-xs text-amber-600 mt-2">
                    Dev OTP: {devOtp}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  maxLength={6}
                />
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
                <button
                  onClick={verifyAndSubmit}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Verifying..." : "Verify & Submit"}
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  &larr; Go back
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your endorsement for {school.name} has been verified and recorded.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-2xl font-mono font-bold text-green-600">{endorsementId}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Save this ID to verify your endorsement later.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/verify?id=${endorsementId}`}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Verify Endorsement
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
