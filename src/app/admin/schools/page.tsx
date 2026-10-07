"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [newSchool, setNewSchool] = useState({ name: "", slug: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchSchools() {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      setSchools(data.schools || []);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    }
  }

  async function addSchool(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add school");
      setSuccess("School added successfully");
      setNewSchool({ name: "", slug: "", location: "" });
      fetchSchools();
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Schools</h1>
            <p className="text-gray-600">Add and manage participating schools</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New School</h2>
            <form onSubmit={addSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  placeholder="e.g. Kisii Primary School"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={newSchool.slug}
                  onChange={(e) => setNewSchool({ ...newSchool, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="e.g. kisii-primary"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newSchool.location}
                  onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                  placeholder="e.g. Kisii Town"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Adding..." : "Add School"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Current Schools</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {schools.map((school) => (
                <div key={school.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">{school.location}</p>
                  </div>
                  <span className="text-sm font-mono text-gray-400">{school.slug}</span>
                </div>
              ))}
              {schools.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No schools added yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
