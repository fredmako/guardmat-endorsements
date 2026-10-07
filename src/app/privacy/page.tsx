import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Guardmat Endorsements",
  description: "Privacy policy for the Guardmat Community School Feeding Initiative endorsement platform.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: October 2026
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600 mb-3">
                When you endorse the Guardmat Community School Feeding Initiative, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Your name</li>
                <li>Your phone number (for verification purposes)</li>
                <li>An optional message of support</li>
                <li>The school you are endorsing</li>
              </ul>
              <p className="text-gray-600 mt-3">
                We do not collect children&apos;s personal information, school records, or any sensitive personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>To verify your endorsement via OTP</li>
                <li>To prevent duplicate endorsements</li>
                <li>To display verified endorsements publicly (name and school only)</li>
                <li>To generate aggregate statistics</li>
                <li>To maintain the integrity of the campaign</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. What We Never Do</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Never share your phone number publicly</li>
                <li>Never sell your data to third parties</li>
                <li>Never collect children&apos;s personal information</li>
                <li>Never post to your social media accounts without your explicit consent</li>
                <li>Never use your data for purposes unrelated to this campaign</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p className="text-gray-600">
                We use industry-standard security measures including encryption in transit (HTTPS), secure database
                policies, and access controls. Your data is stored in Supabase with row-level security enabled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>You can request deletion of your endorsement at any time</li>
                <li>You can contact us to ask what data we hold about you</li>
                <li>You can revoke your consent by contacting us</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact</h2>
              <p className="text-gray-600">
                For privacy-related inquiries, contact us at support@guardmat.co.ke or +254 700 000 000.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Important Note</h2>
              <p className="text-gray-600">
                Endorsements on this platform represent parent and community support for the school feeding initiative.
                They do not constitute official school approval or endorsement by the school administration.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
