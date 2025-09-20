'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PostCard } from './PostCard'
import { PostForm } from './PostForm'
import { Button } from '@/components/ui/button'
import { RefreshCw, Filter } from 'lucide-react'
import type { Post } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'

type SortOption = 'newest' | 'oldest' | 'most_liked'

export function FreedomWall() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuth()

  const fetchPosts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            pen_name
          )
        `)
        .eq('is_hidden', false)

      // Sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'most_liked':
          query = query.order('likes_count', { ascending: false })
          break
      }

      const { data, error } = await query.limit(50)

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      // Check if user liked posts
      if (user && data) {
        const postIds = data.map(post => post.id)
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        const likedPostIds = new Set(likes?.map(like => like.post_id) || [])
        const postsWithLikes = data.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
        }))

        setPosts(postsWithLikes)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [sortBy, user])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleRefresh = () => {
    fetchPosts(true)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <PostForm onPostCreated={() => fetchPosts()} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-200 p-2 rounded-full h-9 w-9"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PostForm onPostCreated={() => fetchPosts()} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Freedom Wall</h2>
          <span className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-3">Sort by</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'most_liked', label: 'Most Liked' },
            ].map(option => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value as SortOption)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-8 paper-texture">
              <div className="text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                The wall is empty
              </h3>
              <p className="text-gray-600">
                Be the first to share your thoughts, poems, or stories!
              </p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={() => fetchPosts()}
            />
          ))
        )}
      </div>

      {posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            You've reached the end of the wall
          </p>
        </div>
      )}
    </div>
  )
}
