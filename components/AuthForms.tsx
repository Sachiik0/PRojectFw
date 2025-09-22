'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

type SignupForm = {
  email: string
  password: string
  penName: string
}

type LoginForm = {
  email: string
  password: string
}

export default function AuthForms({ mode }: AuthFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (data: SignupForm) => {
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      const user = authData?.user
      if (!user) {
        setError('No user returned after signup')
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email: data.email, pen_name: data.penName }])

      if (profileError) {
        if (profileError.code === '23505') {
          if (profileError.message.includes('profiles_email_key')) {
            setError('Email is already taken')
          } else if (profileError.message.includes('profiles_pen_name_key')) {
            setError('Pen name is already taken')
          } else {
            setError('Email or pen name is already taken')
          }
        } else {
          setError('Failed to create profile: ' + profileError.message)
        }
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (loginError) {
        setError(loginError.message)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        if (mode === 'signup') {
          await handleSignup({
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            penName: formData.get('penName') as string,
          })
        } else {
          await handleLogin({
            email: formData.get('email') as string,
            password: formData.get('password') as string,
          })
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
        {loading ? 'Loading…' : mode === 'signup' ? 'Sign Up' : 'Log In'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}
