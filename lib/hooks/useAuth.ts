'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()

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
  }, [])

  const handleLogin = async (formData: FormData) => {
    setAuthLoading(true)
    setError('')

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Redirect to main page after successful login
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignup = async (formData: FormData) => {
    setAuthLoading(true)
    setError('')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const penName = formData.get('penName') as string

    try {
      // Check if pen name is already taken
      const { data: existingPenName } = await supabase
        .from('profiles')
        .select('pen_name')
        .eq('pen_name', penName)
        .maybeSingle()

      if (existingPenName) {
        setError('Pen name is already taken')
        setAuthLoading(false)
        return
      }

      // Check if email is already registered
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (existingEmail) {
        setError('Email is already registered')
        setAuthLoading(false)
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
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

      // Wait for trigger to create profile, then update pen name
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ pen_name: penName })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        setError('Failed to set pen name: ' + updateError.message)
        return
      }

      // Redirect to main page after successful signup
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { 
    user, 
    profile, 
    loading: loading || authLoading, 
    error,
    mode,
    setMode,
    handleLogin,
    handleSignup,
    signOut 
  }
}