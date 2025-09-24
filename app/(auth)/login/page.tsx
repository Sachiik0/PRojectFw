'use client'
export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PenTool, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    loading,
    error,
    mode,
    setMode,
    handleLogin,
    handleSignup
  } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md paper-texture">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <PenTool className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Freedom Wall'}
          </h1>
          <p className="text-gray-600 text-sm">
            {mode === 'login' 
              ? 'Sign in to share your thoughts' 
              : 'Create your account and start expressing yourself'
            }
          </p>
        </div>

        {/* Form */}
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
          className="space-y-5"
        >
          {/* Pen Name Field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="penName" className="block text-sm font-medium text-gray-700 mb-2">
                Pen Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="penName"
                  name="penName"
                  type="text"
                  placeholder="your_pen_name"
                  required
                  className="pl-10 h-12"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This is how others will see you (letters, numbers, and underscores only)
              </p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-1 hover:underline"
          >
            {mode === 'login' ? 'Create one here' : 'Sign in instead'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By {mode === 'signup' ? 'creating an account' : 'signing in'}, you agree to our community guidelines
          </p>
        </div>
      </div>
    </div>
  )
}