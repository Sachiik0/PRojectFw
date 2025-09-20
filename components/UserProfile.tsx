'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { PostCard } from './PostCard'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Calendar, 
  Heart, 
  FileText, 
  Users, 
  UserPlus,
  UserMinus
} from 'lucide-react'
import type { Post, Profile, Follow } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface UserProfileProps {
  penName: string
}

export function UserProfile({ penName }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const { user, profile: currentUserProfile } = useAuth()
  const supabase = createClient()

  const isOwnProfile = currentUserProfile?.pen_name === penName

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('pen_name', penName)
          .single()

        if (profileError || !profileData) {
          console.error('Profile not found:', profileError)
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Fetch user's posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (pen_name)
          `)
          .eq('user_id', profileData.id)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })

        // Check if current user has liked each post
        if (user && postsData) {
          const postIds = postsData.map(post => post.id)
          const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)

          const likedPostIds = new Set(likes?.map(like => like.post_id) || [])
          
          const postsWithLikes = postsData.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id)
          }))

          setPosts(postsWithLikes)
        } else {
          setPosts(postsData || [])
        }

        // Check if current user is following this profile
        if (user && !isOwnProfile) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .single()

          setIsFollowing(!!followData)
        }

      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [penName, user, isOwnProfile, supabase])

  const handleFollow = async () => {
    if (!user || !profile || isOwnProfile) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)

        if (!error) {
          setIsFollowing(false)
          setProfile(prev => prev ? {
            ...prev,
            followers_count: prev.followers_count - 1
          } : null)
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          })

        if (!error) {
          setIsFollowing(true)
          setProfile(prev => prev ? {
            ...prev,
            followers_count: prev.followers_count + 1
          } : null)

          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: profile.id,
              type: 'follow',
              content: `${currentUserProfile?.pen_name || 'Someone'} started following you`,
            })
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gray-200 p-4 rounded-full h-20 w-20"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-8 paper-texture">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">
            The user @{penName} doesn't exist or may have been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-4 rounded-full">
              <User className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.pen_name}</h1>
              <p className="text-gray-600 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatTimeAgo(profile.created_at)}</span>
              </p>
            </div>
          </div>
          
          {!isOwnProfile && user && (
            <Button
              onClick={handleFollow}
              disabled={followLoading}
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center space-x-2"
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">{profile.posts_count}</span>
            </div>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">{profile.followers_count}</span>
            </div>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Heart className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">
                {posts.reduce((total, post) => total + post.likes_count, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 paper-texture">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isOwnProfile ? 'Your Posts' : `Posts by ${profile.pen_name}`}
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-8 text-center paper-texture">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? 'No posts yet' : 'No posts to show'}
            </h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? 'Share your first thought, poem, or story with the world!'
                : `${profile.pen_name} hasn't shared anything yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onPostUpdate={() => window.location.reload()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}