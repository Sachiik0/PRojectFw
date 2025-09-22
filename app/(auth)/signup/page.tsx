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
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [penName, setPenName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1️⃣ Check if email already exists
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        setError('Email is already taken');
        return;
      }

      // 2️⃣ Check if pen name already exists
      const { data: existingPen } = await supabase
        .from('profiles')
        .select('pen_name')
        .eq('pen_name', penName)
        .maybeSingle();

      if (existingPen) {
        setError('Pen name is already taken');
        return;
      }

      // 3️⃣ Create auth user
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

      // 4️⃣ Insert profile row with correct pen name
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email,
          pen_name: penName, // <- ensure this is explicitly passed
        },
      ]);

      if (profileError) {
        setError('Failed to create profile: ' + profileError.message);
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
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md paper-texture">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <button
            onClick={() => setMode('login')}
            className="text-blue-500 hover:underline"
          >
            Already have an account? Log in
          </button>
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
            autoComplete="off"
            required
            className="w-full rounded border p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
            className="w-full rounded border p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded border p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-500 p-2 text-white disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
}
