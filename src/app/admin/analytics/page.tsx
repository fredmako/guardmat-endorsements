"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">View campaign analytics and insights</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {stats && (
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.summary.totalEndorsements}</div>
                    <div className="text-xs text-gray-600">Total Endorsements</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.summary.participatingSchools}</div>
                    <div className="text-xs text-gray-600">Schools</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.summary.flaggedEndorsements}</div>
                    <div className="text-xs text-gray-600">Flagged</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">By School</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(stats.bySchool).map(([school, count]) => (
                      <div key={school} className="flex justify-between py-1">
                        <span className="text-sm text-gray-700">{school}</span>
                        <span className="text-sm font-medium text-gray-900">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">By Month</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(stats.byMonth).map(([month, count]) => (
                      <div key={month} className="flex justify-between py-1">
                        <span className="text-sm text-gray-700">{month}</span>
                        <span className="text-sm font-medium text-gray-900">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!stats && !loading && (
              <div className="p-8 text-center text-gray-500">
                Click refresh to load analytics
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
