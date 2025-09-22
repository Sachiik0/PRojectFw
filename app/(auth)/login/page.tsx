'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const {
    loading,
    error,
    mode,
    setMode,
    handleLogin,
    handleSignup
  } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-500 hover:underline"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>

        <form
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            if (mode === 'signup') {
              await handleSignup(formData)
            } else {
              await handleLogin(formData)
            }
          }}
          className="space-y-4"
        >
          {mode === 'signup' && (
            <input
              type="text"
              name="penName"
              placeholder="Pen Name"
              required
              className="w-full rounded border p-2"
            />
          )}

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
            {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}