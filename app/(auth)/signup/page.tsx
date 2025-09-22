'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function SignupPage() {
  const {
    loading,
    error,
    mode,
    setMode,
    handleSignup
  } = useAuth()

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
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await handleSignup(formData)
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
  )
}