"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const userEmail = data.session.user.email;
        fetch("/api/admin/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }).then((res) => res.json()).then((result) => {
          if (result.isAdmin) setIsAdmin(true);
        });
      }
    });
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full guardmat-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className={`font-bold text-lg ${scrolled ? "text-gray-900" : "text-white"}`}>
              Guardmat
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#about"
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              About
            </Link>
            <Link
              href="/#schools"
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Schools
            </Link>
            <Link
              href="/#stats"
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Stats
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              href="/endorse"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Support Now
            </Link>
          </nav>
          <Link
            href="/endorse"
            className="md:hidden px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg"
          >
            Support
          </Link>
        </div>
      </div>
    </header>
  );
}
