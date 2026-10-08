"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

interface Endorsement {
  id: string;
  endorsement_id: string;
  school_name: string;
  parent_name: string;
  phone: string;
  message: string | null;
  verified: boolean;
  flagged: boolean;
  flag_reason: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  verified: number;
  flagged: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterFlagged, setFilterFlagged] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const pathname = usePathname();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/admin" },
    { id: "users", label: "Users", href: "/admin/users" },
    { id: "analytics", label: "Analytics", href: "/admin/analytics" },
    { id: "campaigns", label: "Campaigns", href: "/admin/campaigns" },
    { id: "reports", label: "Reports", href: "/admin/reports" },
    { id: "schools", label: "Schools", href: "/admin/schools" },
    { id: "settings", label: "Settings", href: "/admin/settings" },
  ];

  const activeTab = tabs.find(t => pathname === t.href)?.id || "dashboard";

  async function handleGoogleLogin() {
    if (!supabase) return;
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setAuthenticated(true);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData() {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (search) params.set("search", search);
      if (filterSchool) params.set("schoolId", filterSchool);
      if (filterVerified) params.set("verified", filterVerified);
      if (filterFlagged) params.set("flagged", filterFlagged);

      const [endorsementsRes, schoolsRes] = await Promise.all([
        fetch(`/api/admin/endorsements?${params}`),
        fetch("/api/schools"),
      ]);
      const endorsementsData = await endorsementsRes.json();
      const schoolsData = await schoolsRes.json();

      setEndorsements(endorsementsData.endorsements || []);
      setTotalPages(endorsementsData.totalPages || 1);
      setSchools(schoolsData.schools || []);

      const allRes = await fetch("/api/admin/endorsements?limit=1000");
      const allData = await allRes.json();
      const all = allData.endorsements || [];
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthKey = now.toISOString().slice(0, 7);

      setStats({
        total: all.length,
        verified: all.filter((e: Endorsement) => e.verified).length,
        flagged: all.filter((e: Endorsement) => e.flagged).length,
        today: all.filter((e: Endorsement) => e.created_at.startsWith(today)).length,
        thisWeek: all.filter((e: Endorsement) => e.created_at >= weekAgo).length,
        thisMonth: all.filter((e: Endorsement) => e.created_at.startsWith(monthKey)).length,
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }

  useEffect(() => {
    if (!supabase) return;
    // Check for existing Google session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const userEmail = data.session.user.email;
        fetch("/api/admin/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json()).then((result) => {
          if (result.isAdmin) {
            setAuthenticated(true);
            fetchData();
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, page, search, filterSchool, filterVerified, filterFlagged]);

  async function handleFlag(id: string, action: string) {
    try {
      const res = await fetch("/api/admin/endorsements/flag", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endorsementId: id, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      fetchData();
    } catch (err) {
      console.error("Action failed:", err);
    }
  }

  function exportCsv() {
    const headers = ["Endorsement ID", "School", "Parent Name", "Phone", "Verified", "Flagged", "Date"];
    const rows = endorsements.map((e) => [
      e.endorsement_id,
      e.school_name,
      e.parent_name,
      e.phone,
      e.verified ? "Yes" : "No",
      e.flagged ? "Yes" : "No",
      new Date(e.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guardmat-endorsements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Login</h1>
                <p className="text-sm text-gray-600">Guardmat Endorsement Platform</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@guardmat.co.ke"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  disabled={!supabase}
                  className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                </button>
              </div>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage endorsements and view statistics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportCsv}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={async () => {
                  if (supabase) await supabase.auth.signOut();
                  setAuthenticated(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-6">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
                <div className="text-xs text-gray-600">Flagged</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                <div className="text-xs text-gray-600">Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-amber-600">{stats.thisMonth}</div>
                <div className="text-xs text-gray-600">This Month</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, or phone..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">All Schools</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                <select
                  value={filterFlagged}
                  onChange={(e) => setFilterFlagged(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">All</option>
                  <option value="true">Flagged</option>
                  <option value="false">Not Flagged</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {endorsements.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{e.endorsement_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{e.school_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{e.parent_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{e.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${e.flagged ? "bg-red-100 text-red-700" : e.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {e.flagged ? "Flagged" : e.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {e.flagged ? (
                            <button
                              onClick={() => handleFlag(e.endorsement_id, "unflag")}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              Unflag
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleFlag(e.endorsement_id, "flag")}
                                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                              >
                                Flag
                              </button>
                              <button
                                onClick={() => handleFlag(e.endorsement_id, "revoke")}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
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
