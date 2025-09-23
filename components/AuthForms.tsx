'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  penName: z.string()
    .min(3, 'Pen name must be at least 3 characters')
    .max(50, 'Pen name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Pen name can only contain letters, numbers, and underscores'),
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

interface AuthFormsProps {
  mode: 'login' | 'signup'
  onShowTerms?: () => void
  termsAccepted?: boolean
}

export function AuthForms({ mode, onShowTerms, termsAccepted = false }: AuthFormsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', penName: '' },
  })

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (data: SignupForm) => {
    if (!termsAccepted) {
      setError('You must accept the Terms & Conditions to sign up')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Check if pen name is already taken BEFORE creating auth user
      const { data: existingPenName } = await supabase
        .from('profiles')
        .select('pen_name')
        .eq('pen_name', data.penName)
        .maybeSingle()

      if (existingPenName) {
        setError('Pen name is already taken')
        setLoading(false)
        return
      }

      // 2. Check if email is already registered
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle()

      if (existingEmail) {
        setError('Email is already registered')
        setLoading(false)
        return
      }

      // 3. Create auth user
      console.log('Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        setError(authError.message)
        return
      }

      const user = authData?.user
      if (!user) {
        setError('No user returned after signup')
        return
      }

      console.log('User created:', user.id)

      // 4. Wait for trigger to complete, then check if profile exists
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Existing profile:', existingProfile)

      if (existingProfile) {
        // Profile exists, update it
        console.log('Updating existing profile with pen name:', data.penName)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ pen_name: data.penName })
          .eq('id', user.id)

        if (updateError) {
          console.error('Update error:', updateError)
          setError('Failed to update pen name: ' + updateError.message)
          return
        }
      } else {
        // No profile exists, create one
        console.log('Creating new profile with pen name:', data.penName)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: data.email,
            pen_name: data.penName,
            followers_count: 0,
            following_count: 0,
            posts_count: 0
          })

        if (insertError) {
          console.error('Insert error:', insertError)
          setError('Failed to create profile: ' + insertError.message)
          return
        }
      }

      setSuccess('Account created successfully!')
      
      // Wait to show success message, then redirect
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)

    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'login') {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to share your thoughts</p>
        </div>

        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...loginForm.register('email')}
              placeholder="your@email.com"
            />
            {loginForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...loginForm.register('password')}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-amber-600 hover:underline font-medium"
          >
            Join the wall
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Join the Freedom Wall</h1>
        <p className="text-gray-600 mt-2">Create your account and start sharing</p>
      </div>

      <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
        <div>
          <label htmlFor="penName" className="block text-sm font-medium text-gray-700 mb-1">
            Pen Name
          </label>
          <Input
            id="penName"
            type="text"
            {...signupForm.register('penName')}
            placeholder="your_pen_name"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how others will see you on the wall
          </p>
          {signupForm.formState.errors.penName && (
            <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.penName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...signupForm.register('email')}
            placeholder="your@email.com"
          />
          {signupForm.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...signupForm.register('password')}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {signupForm.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.password.message}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={() => onShowTerms?.()}
            className="mt-1"
          />
          <div className="text-sm">
            <button
              type="button"
              onClick={onShowTerms}
              className="text-blue-500 hover:underline"
            >
              I accept the Terms & Conditions
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Click to read and accept our community guidelines
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button type="submit" className="w-full" disabled={loading || !termsAccepted}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          onClick={() => router.push('/login')}
          className="text-amber-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}