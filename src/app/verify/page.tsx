"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface VerificationResult {
  endorsementId: string;
  schoolName: string;
  parentName: string;
  message: string | null;
  verified: boolean;
  createdAt: string;
  verifiedAt: string | null;
  status: string;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [endorsementId, setEndorsementId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setEndorsementId(id);
      verifyEndorsement(id);
    }
  }, [searchParams]);

  async function verifyEndorsement(id: string) {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`/api/endorse?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (endorsementId.trim()) {
      verifyEndorsement(endorsementId.trim());
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Endorsement</h1>
            <p className="text-gray-600">Enter an endorsement ID to verify its authenticity</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endorsement ID</label>
                <input
                  type="text"
                  value={endorsementId}
                  onChange={(e) => setEndorsementId(e.target.value)}
                  placeholder="e.g. GUARDMAT-END-2026-000123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !endorsementId.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg ${result.status === "verified" ? "bg-green-50 border border-green-200" : result.status === "revoked" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.status === "verified" && (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-green-700">Verified Endorsement</span>
                      </>
                    )}
                    {result.status === "revoked" && (
                      <>
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-red-700">Revoked Endorsement</span>
                      </>
                    )}
                    {result.status === "pending" && (
                      <>
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-amber-700">Pending Verification</span>
                      </>
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Endorsement ID:</dt>
                      <dd className="font-mono font-medium">{result.endorsementId}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">School:</dt>
                      <dd className="font-medium">{result.schoolName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Endorsed by:</dt>
                      <dd className="font-medium">{result.parentName}</dd>
                    </div>
                    {result.message && (
                      <div className="pt-2 border-t border-gray-200">
                        <dt className="text-gray-600 mb-1">Message:</dt>
                        <dd className="text-gray-800 italic">&ldquo;{result.message}&rdquo;</dd>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <dt className="text-gray-600">Date:</dt>
                      <dd className="font-medium">{new Date(result.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  This endorsement represents parent/community support, not official school approval.
                </p>
              </div>
            )}

            {searched && !result && !error && !loading && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                No endorsement found with that ID. Please check the ID and try again.
              </div>
            )}
          </div>

          <div className="mt-6 text-center space-y-3">
            <Link href="/" className="text-sm text-green-600 hover:text-green-700">
              &larr; Back to Home
            </Link>
            {result && result.endorsementId && (
              <div>
                <a
                  href={`/api/admin/pdf?id=${encodeURIComponent(result.endorsementId)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Certificate (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
