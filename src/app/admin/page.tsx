"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
                onClick={() => setAuthenticated(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
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
