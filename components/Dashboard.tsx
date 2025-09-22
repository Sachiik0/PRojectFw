'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { PostCard } from './PostCard'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Heart, 
  Users, 
  FileText, 
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react'
import type { Post, Notification } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

// Force dynamic rendering for SSR
export const dynamic = 'force-dynamic'

export function Dashboard() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalFollowers: 0,
    totalFollowing: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !profile) return

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch user's posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`*, profiles (pen_name)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setPosts(postsData || [])

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        setNotifications(notificationsData || [])

        // Update stats
        const totalLikes = postsData?.reduce((sum, post) => sum + post.likes_count, 0) || 0
        setStats({
          totalPosts: profile.posts_count,
          totalLikes,
          totalFollowers: profile.followers_count,
          totalFollowing: profile.following_count
        })

        // Mark notifications as read
        if (notificationsData?.length) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, profile, supabase])

  if (!user || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/60 rounded-lg p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.pen_name}</h1>
            <p className="text-gray-600">Here's what's happening with your posts</p>
          </div>
          <Link href={`/profile/${profile.pen_name}`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>View Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FileText, label: 'Posts', value: stats.totalPosts, color: 'blue' },
          { icon: Heart, label: 'Total Likes', value: stats.totalLikes, color: 'red' },
          { icon: Users, label: 'Followers', value: stats.totalFollowers, color: 'green' },
          { icon: TrendingUp, label: 'Following', value: stats.totalFollowing, color: 'purple' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
            <div className="flex items-center space-x-3">
              <div className={`bg-${color}-100 p-3 rounded-full`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Your Posts</span>
            </h2>
            <span className="text-sm text-gray-500">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-8 text-center paper-texture">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Share your first thought, poem, or story with the world!</p>
              <Link href="/">
                <Button>Write Your First Post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdate={() => window.location.reload()} />
              ))}
            </div>
          )}
        </div>

        {/* Notifications & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </h2>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${n.type === 'like' ? 'bg-red-100' : 'bg-blue-100'}`}>
                      {n.type === 'like' ? (
                        <Heart className="h-4 w-4 text-red-600" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{n.content}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All Activity
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
            <h3 className="font-medium text-gray-900 mb-4">This Month</h3>
            {[
              { label: 'New Posts', filter: (p: Post) => {
                  const d = new Date(p.created_at)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }, value: posts
              },
              { label: 'New Likes', filter: (n: Notification) => 
                  n.type === 'like' && new Date(n.created_at).getMonth() === new Date().getMonth(), value: notifications
              },
              { label: 'New Followers', filter: (n: Notification) => 
                  n.type === 'follow' && new Date(n.created_at).getMonth() === new Date().getMonth(), value: notifications
              }
            ].map(({ label, filter, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">
                  {Array.isArray(value) ? value.filter(filter as any).length : 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
