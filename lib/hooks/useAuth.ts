'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  mode: 'login' | 'signup';
  signOut: () => Promise<void>;
  handleLogin: (formData: FormData) => Promise<void>;
  handleSignup: (formData: FormData) => Promise<void>;
  setMode: (mode: 'login' | 'signup') => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async (formData: FormData) => {
    try {
      setLoading(true)
      setError(null)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (formData: FormData) => {
  try {
    setLoading(true)
    setError(null)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const penName = formData.get('penName') as string

    // Validate pen name
    if (!penName || penName.trim() === '') {
      throw new Error('Pen name is required')
    }

    // Check if pen name is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('pen_name')
      .eq('pen_name', penName)
      .maybeSingle()

    if (existingProfile) {
      throw new Error('Pen name is already taken')
    }

    // 1. Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          pen_name: penName // Store pen name in auth metadata
        }
      }
    })

    if (signUpError) throw signUpError

    // 2. Create their profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          pen_name: penName,
          email: email,
          followers_count: 0,
          following_count: 0,
          posts_count: 0
        }])
        .select()
        .single()

      if (profileError) {
        throw new Error(profileError.message || 'Failed to create profile')
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('An unexpected error occurred')
    }
  } finally {
    setLoading(false)
  }
}

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    mode,
    signOut,
    handleLogin,
    handleSignup,
    setMode
  }
}