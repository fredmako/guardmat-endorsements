"use client";

import { useState } from "react";

interface EndorsementFormProps {
  schools: { id: string; name: string; slug: string; location: string }[];
  selectedSchool?: string;
  onSubmit: (data: {
    schoolId: string;
    parentName: string;
    phone: string;
    message: string;
    consent: boolean;
  }) => void;
  loading?: boolean;
}

export default function EndorsementForm({
  schools,
  selectedSchool = "",
  onSubmit,
  loading = false,
}: EndorsementFormProps) {
  const [schoolId, setSchoolId] = useState(selectedSchool);
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!schoolId) newErrors.school = "Please select a school";
    if (!parentName.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!consent) newErrors.consent = "Consent is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ schoolId, parentName, phone, message, consent });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select School *</label>
        <select
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        >
          <option value="">Choose a school</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} - {school.location}
            </option>
          ))}
        </select>
        {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          type="text"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +254712345678"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message of support..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="consent" className="text-sm text-gray-600">
          I consent to Guardmat Supermarket Kisii storing my name and phone number for verification purposes.
          I understand this endorsement represents community support, not official school approval. *
        </label>
      </div>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? "Submitting..." : "Submit Endorsement"}
      </button>
    </form>
  );
}
