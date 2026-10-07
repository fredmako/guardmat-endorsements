"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QRCode from "@/components/QRCode";
import { SOCIAL_SHARE_URL } from "@/lib/constants";

export default function CampaignPlannerPage() {
  const [activeWeek, setActiveWeek] = useState(1);

  const weeks = [
    {
      week: 1,
      title: "Awareness",
      goal: "Spread the word about the initiative",
      activities: [
        "Launch campaign on social media",
        "Distribute posters to schools",
        "Send WhatsApp messages to parent groups",
        "Local radio announcement",
        "Community leaders endorsement",
      ],
      channels: ["Social Media", "WhatsApp", "Posters", "Radio", "Word of Mouth"],
    },
    {
      week: 2,
      title: "Community Participation",
      goal: "Get parents and community members to endorse",
      activities: [
        "School visits for in-person endorsements",
        "Community meetings and barazas",
        "Local business partnerships",
        "Church/mosque outreach",
        "Influencer advocacy",
      ],
      channels: ["In-Person", "Community Events", "Partnerships", "Religious Centers"],
    },
    {
      week: 3,
      title: "Impact & Progress",
      goal: "Show progress and keep momentum",
      activities: [
        "Share progress updates on social media",
        "Publish endorsement milestones",
        "Thank you messages to endorsers",
        "Local media coverage",
        "School feedback sharing",
      ],
      channels: ["Social Media", "Media", "Email", "School Communication"],
    },
    {
      week: 4,
      title: "Final Push & Appreciation",
      goal: "Reach target and thank supporters",
      activities: [
        "Final countdown campaign",
        "Thank you event for top endorsers",
        "Share final results",
        "Appreciation certificates",
        "Plan for next phase",
      ],
      channels: ["Events", "Social Media", "Certificates", "Community Gathering"],
    },
  ];

  const currentWeek = weeks[activeWeek - 1];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              30-Day Social Campaign Planner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A week-by-week plan to maximize community engagement and reach the endorsement target.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                <div className="flex gap-2 mb-6">
                  {weeks.map((w) => (
                    <button
                      key={w.week}
                      onClick={() => setActiveWeek(w.week)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        activeWeek === w.week
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Week {w.week}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Week {currentWeek.week}: {currentWeek.title}
                  </h2>
                  <p className="text-gray-600">{currentWeek.goal}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Activities</h3>
                  <ul className="space-y-2">
                    {currentWeek.activities.map((activity, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Channels</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentWeek.channels.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Campaign QR Code</h3>
                <div className="flex justify-center mb-4">
                  <QRCode value={SOCIAL_SHARE_URL} size={180} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan to visit the campaign page
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Campaign URL</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {SOCIAL_SHARE_URL}
                  </p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(SOCIAL_SHARE_URL)}
                  className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Copy URL
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Campaign Duration</span>
                    <span className="text-sm font-medium">30 Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="text-sm font-medium">1,000 Endorsements</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Schools</span>
                    <span className="text-sm font-medium">5 Participating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
