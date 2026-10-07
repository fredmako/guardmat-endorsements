"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full guardmat-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">Guardmat Supermarket Kisii</span>
            </div>
            <p className="text-gray-400 text-sm">
              Supporting school feeding programs for primary school pupils in Kisii County through community endorsements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/endorse" className="hover:text-white transition-colors">Endorse</Link></li>
              <li><Link href="/verify" className="hover:text-white transition-colors">Verify</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Kisii County, Kenya</li>
              <li>support@guardmat.co.ke</li>
              <li>+254 700 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Guardmat Supermarket Kisii. All rights reserved.</p>
          <p className="mt-2">
            Endorsements represent parent/community support, not official school approval.
          </p>
        </div>
      </div>
    </footer>
  );
}
