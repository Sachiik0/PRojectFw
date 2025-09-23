'use client'

import { useState } from 'react'
import { AuthForms } from '@/components/AuthForms'

export default function SignupPage() {
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleShowTerms = () => {
    setShowTerms(true)
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setShowTerms(false)
  }

  return (
    <>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md paper-texture">
          <AuthForms 
            mode="signup" 
            onShowTerms={handleShowTerms}
            termsAccepted={termsAccepted}
          />
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
            <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto">
              <p>✅ This platform is for free expression while respecting others.</p>
              <p>
                ✅ You may choose to include your social media in your posts —{' '}
                <b>but it's completely optional</b>.
              </p>
              <p>🚫 Rules & Violations:</p>
              <ul className="list-disc pl-5">
                <li>No harassment, hate speech, or threats.</li>
                <li>No fake identities to harm others.</li>
                <li>No posting of private info without consent.</li>
              </ul>
              <p>⚖️ Consequences:</p>
              <ul className="list-disc pl-5">
                <li>Warnings for first violations.</li>
                <li>Temporary suspension for repeated violations.</li>
                <li>Permanent ban for severe/continued abuse.</li>
              </ul>
              <p>🔒 Privacy & Safety:</p>
              <ul className="list-disc pl-5">
                <li>Hindi ka ma-reredtag — we protect your identity and freedom.</li>
                <li>We do <b>not</b> sell or share your personal information.</li>
                <li>Your data is only used for account security and platform improvement.</li>
              </ul>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleAcceptTerms}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}