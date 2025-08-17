import React from "react"

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p>
        This Privacy Policy explains how [App Name], in partnership with PESO Lipa, collects, uses, and protects your personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Personal details (name, email, contact number, address)</li>
        <li>Professional details (resume, skills, work experience, education)</li>
        <li>Employer information (company name, registration documents)</li>
        <li>Usage and log data for security and analytics</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>To provide and improve recruitment services</li>
        <li>To match job seekers with relevant employers</li>
        <li>To verify employer legitimacy</li>
        <li>To comply with legal requirements</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3. Data Sharing</h2>
      <p>
        Your information will be shared only with relevant parties (employers, PESO admins) as needed to provide services, and in compliance with the Data Privacy Act of 2012.
      </p>

      <h2 className="text-xl font-semibold mt-6">4. Security</h2>
      <p>
        We implement industry-standard security measures to protect your data from unauthorized access.
      </p>

      <h2 className="text-xl font-semibold mt-6">5. Your Rights</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Access, correct, or delete your personal data</li>
        <li>Withdraw consent for processing</li>
        <li>File a complaint with the National Privacy Commission</li>
      </ul>

      <p className="mt-6">
        For questions about this Privacy Policy, contact us at <a href="mailto:support@yourapp.com" className="text-blue-600">support@yourapp.com</a>.
      </p>
    </div>
  )
}
