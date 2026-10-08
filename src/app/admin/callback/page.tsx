"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function CallbackHandler() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase implicit flow puts tokens in the URL hash, not query params
    const hash = window.location.hash;
    if (!hash) {
      setError("No authorization code received");
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setError("No authorization code received");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    // Set the session from the hash token
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: params.get("refresh_token") || "",
    }).then(({ data, error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        const userEmail = data.session.user.email;
        fetch("/api/admin/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json()).then((result) => {
          if (result.isAdmin) {
            // Clear the hash before redirecting
            window.location.hash = "";
            router.push("/admin");
          } else {
            setError("Not authorized as admin");
          }
        });
      } else {
        setError("Failed to create session");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we verify your account</p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
          <p className="text-gray-600">Please wait while we verify your account</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
