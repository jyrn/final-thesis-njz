import React, { useState } from "react"

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState("jobseeker")

  const tabs = [
    { key: "jobseeker", label: "Job Seeker" },
    { key: "employer", label: "Employer" },
    { key: "admin", label: "PESO Administrator" },
  ]

  const termsContent: Record<string, JSX.Element> = {
    jobseeker: (
      <div>
        <h2 className="text-xl font-semibold mb-2">Terms & Conditions – Job Seeker</h2>
        <p>
          By creating a Job Seeker account with [App Name] in partnership with PESO Lipa, you agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Provide truthful and up-to-date details in your profile, resume, and applications.</li>
          <li>Use the platform only for legitimate job searching.</li>
          <li>Your data may be processed by AI for matching purposes.</li>
          <li>Your information may be shared with employers you apply to, PESO admins, and as required by law.</li>
          <li>No guarantee of employment is provided.</li>
          <li>You agree to comply with the Data Privacy Act of 2012 and all platform rules.</li>
        </ul>
      </div>
    ),
    employer: (
      <div>
        <h2 className="text-xl font-semibold mb-2">Terms & Conditions – Employer</h2>
        <p>
          By creating an Employer account with [App Name] in partnership with PESO Lipa, you agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Post accurate job details (descriptions, requirements, compensation).</li>
          <li>Comply with all Philippine labor laws and PESO policies.</li>
          <li>Use candidate data only for lawful recruitment purposes.</li>
          <li>Respect the Data Privacy Act of 2012 and never misuse applicant information.</li>
          <li>Understand that AI recommendations are suggestions only.</li>
        </ul>
      </div>
    ),
    admin: (
      <div>
        <h2 className="text-xl font-semibold mb-2">Terms & Conditions – PESO Administrator</h2>
        <p>
          By creating a PESO Administrator account with [App Name], you agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Use the system only as an authorized PESO Lipa representative.</li>
          <li>Ensure compliance with Philippine labor laws and PESO policies.</li>
          <li>Maintain confidentiality of all user data.</li>
          <li>Verify employer legitimacy and job postings.</li>
          <li>Not share admin credentials or disclose unauthorized data.</li>
        </ul>
      </div>
    ),
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 rounded-lg shadow">{termsContent[activeTab]}</div>
    </div>
  )
}
