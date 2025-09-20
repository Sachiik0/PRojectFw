'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { PenTool, User, LogOut, Home, BarChart3 } from 'lucide-react'

export function Navigation() {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PenTool className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-bold text-gray-800">Freedom Wall</span>
            </div>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <PenTool className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-gray-800">Freedom Wall</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <>
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Wall</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link href={`/profile/${profile.pen_name}`} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile.pen_name}</span>
                </Link>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Join Wall
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}