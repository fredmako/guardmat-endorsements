"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface Endorsement {
  endorsement_id: string;
  school_name: string;
  parent_name: string;
  message: string | null;
  verified: boolean;
  flagged: boolean;
  created_at: string;
  verified_at: string | null;
  user_id: string;
  auth_provider: string;
}

interface LoyaltyPoints {
  totalPoints: number;
  endorsementsCount: number;
  lastUpdated: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [points, setPoints] = useState<LoyaltyPoints>({ totalPoints: 0, endorsementsCount: 0, lastUpdated: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase is not configured");
      setLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
      } else {
        // Redirect to home if not signed in
        window.location.href = "/";
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        window.location.href = "/";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEndorsements = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/user/endorsements?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch endorsements");
      setEndorsements(data.endorsements || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const fetchPoints = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/user/points?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch points");
      setPoints(data);
    } catch (err: any) {
      console.error("Failed to fetch points:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEndorsements(user.id);
      fetchPoints(user.id);
    }
  }, [user, fetchEndorsements, fetchPoints]);

  const handleSignOut = useCallback(async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Please sign in to view your dashboard.</p>
            <Link href="/" className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg">
              Go Home
            </Link>
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loyalty Points Card */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Loyalty Points Balance</p>
                <p className="text-4xl font-bold">{points.totalPoints}</p>
                <p className="text-amber-100 text-sm mt-1">
                  {points.endorsementsCount} endorsement{points.endorsementsCount !== 1 ? "s" : ""} submitted
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-amber-100 text-xs">
                Earn 10 points for every endorsement. Points can be redeemed for rewards at Guardmat Supermarket Kisii.
              </p>
            </div>
          </div>

          {/* Endorsements History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Endorsement History</h2>
            
            {endorsements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">You haven&apos;t submitted any endorsements yet.</p>
                <Link
                  href="/endorse"
                  className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Endorse Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {endorsements.map((endorsement) => (
                  <div
                    key={endorsement.endorsement_id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{endorsement.school_name}</h3>
                          {endorsement.flagged ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              Revoked
                            </span>
                          ) : endorsement.verified ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(endorsement.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          ID: {endorsement.endorsement_id}
                        </p>
                        {endorsement.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            &ldquo;{endorsement.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/verify?id=${endorsement.endorsement_id}`}
                          className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 rounded-lg transition-colors"
                        >
                          Verify
                        </Link>
                        <a
                          href={`/api/admin/pdf?id=${encodeURIComponent(endorsement.endorsement_id)}`}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
                        >
                          Certificate
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/endorse"
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">New Endorsement</p>
                <p className="text-sm text-gray-500">Support another school</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Back to Home</p>
                <p className="text-sm text-gray-500">View campaign progress</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}