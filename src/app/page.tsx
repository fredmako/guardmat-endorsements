"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Stats {
  totalVerified: number;
  participatingSchools: number;
  target: number;
  progress: number;
  daysRemaining: number;
  monthlyEndorsements: number;
  campaignName: string;
  campaignStart: string;
  campaignEnd: string;
}

interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignRes, schoolsRes] = await Promise.all([
          fetch("/api/campaign"),
          fetch("/api/schools"),
        ]);
        const campaignData = await campaignRes.json();
        const schoolsData = await schoolsRes.json();
        setStats(campaignData.stats);
        setSchools(schoolsData.schools || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="guardmat-gradient min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              Guardmat Supermarket Kisii
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Community School Feeding Initiative
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Support school feeding programs for primary school pupils in Kisii County.
              Your endorsement shows you care about our children&apos;s future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/endorse"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg"
              >
                Support the Initiative
              </Link>
              <Link
                href="/verify"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-lg transition-colors border border-white/30"
              >
                Verify Endorsement
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Community Support Matters
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Every child deserves a nutritious meal at school. The Guardmat Community School Feeding Initiative
                brings together parents, community members, and local businesses to ensure no child learns on an empty stomach.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-green-50">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Better Learning</h3>
                <p className="text-gray-600 text-sm">Well-nourished children concentrate better and perform well in class.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-amber-50">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Healthier Children</h3>
                <p className="text-gray-600 text-sm">Regular meals improve children&apos;s health and reduce illness-related absenteeism.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-blue-50">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Stronger Community</h3>
                <p className="text-gray-600 text-sm">When we invest in our children, we invest in our community&apos;s future.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Campaign Progress</h2>
              <p className="text-lg text-gray-600">Together, we are making a difference</p>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Loading stats...</div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalVerified.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Verified Endorsements</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">{stats.participatingSchools}</div>
                  <div className="text-sm text-gray-600">Participating Schools</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.daysRemaining}</div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.progress}%</div>
                  <div className="text-sm text-gray-600">Campaign Progress</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">No stats available</div>
            )}
          </div>
        </section>

        {/* Schools Section */}
        <section id="schools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Participating Schools</h2>
              <p className="text-lg text-gray-600">Endorse a school near you</p>
            </div>
            {schools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <Link
                    key={school.id}
                    href={`/endorse/${school.slug}`}
                    className="block p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                  >
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-green-600 transition-colors">
                      {school.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{school.location}</p>
                    <span className="text-sm text-green-600 font-medium">
                      Endorse this school &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No schools available yet</div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 guardmat-gradient">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-white/90 mb-8">
              It takes less than 2 minutes to endorse. Your support shows our children that their community cares.
            </p>
            <Link
              href="/endorse"
              className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg"
            >
              Endorse Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
