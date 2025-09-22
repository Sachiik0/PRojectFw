'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [penName, setPenName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSignup = async () => {
    if (!accepted) {
      setError('You must accept the Terms & Conditions to sign up');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1️⃣ Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const user = authData?.user;
      if (!user) {
        setError('No user returned after signup');
        return;
      }

      // 2️⃣ Update pen_name (profile already created by Supabase trigger)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ pen_name: penName })
        .eq('id', user.id);

      if (updateError) {
        setError('Failed to update profile: ' + updateError.message);
        return;
      }

      setSuccess('User created successfully!');
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="penName"
            placeholder="Pen Name"
            value={penName}
            onChange={(e) => setPenName(e.target.value)}
            required
            className="w-full rounded border p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border p-2"
          />

          {/* Terms & Conditions */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-blue-500 underline text-sm"
            >
              I accept the Terms & Conditions
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-500 p-2 text-white disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}
        </form>
      </div>

      {/* Terms & Conditions Popup */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
            <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto">
              <p>✅ This platform is for free expression while respecting others.</p>
              <p>
                ✅ You may choose to include your social media in your posts —{' '}
                <b>but it’s completely optional</b>.
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
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAccepted(true);
                  setShowTerms(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
