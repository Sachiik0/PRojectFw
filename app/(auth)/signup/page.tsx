'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  const handleSignup = async (formData: FormData) => {
    setLoading(true);
    setError('');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const penName = formData.get('penName') as string;

    try {
      // 1️⃣ Check if pen name is already taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('pen_name')
        .eq('pen_name', penName)
        .maybeSingle();

      if (existingProfile) {
        setError('Pen name is already taken');
        return;
      }

      // 2️⃣ Create auth user
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

      // 3️⃣ Insert profile row with foreign key = auth user id
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id, // must match auth.users.id
          email,
          pen_name: penName,
        },
      ]);

      if (profileError) {
        // Handle duplicate key errors cleanly
        if (profileError.code === '23505') {
          if (profileError.message.includes('profiles_email_key')) {
            setError('Email is already taken');
          } else if (profileError.message.includes('profiles_pen_name_key')) {
            setError('Pen name is already taken');
          } else {
            setError('Email or pen name is already taken');
          }
        } else if (profileError.code === '23503') {
          setError('Auth user not created properly. Try again.');
        } else {
          setError('Failed to create profile: ' + profileError.message);
        }
        return;
      }

      // 4️⃣ Success → redirect
      router.push('/');
      router.refresh();
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
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleSignup(formData);
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="penName"
            placeholder="Pen Name"
            required
            className="w-full rounded border p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full rounded border p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
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

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
