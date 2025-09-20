'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Flag, User, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Post } from '@/lib/types'
import { ReportModal } from './ReportModal'

interface PostCardProps {
  post: Post
  onPostUpdate?: () => void
}

export function PostCard({ post, onPostUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleLike = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)

        if (!error) {
          setIsLiked(false)
          setLikesCount(prev => prev - 1)
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          })

        if (!error) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)

          // Create notification for post author
          if (post.user_id !== user.id) {
            await supabase
              .from('notifications')
              .insert({
                user_id: post.user_id,
                type: 'like',
                content: `${post.profiles?.pen_name || 'Someone'} liked your post`,
              })
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReport = () => {
    setShowReportModal(true)
    setShowMenu(false)
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-4 paper-texture hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <Link 
                href={`/profile/${post.profiles?.pen_name}`}
                className="font-medium text-gray-900 hover:text-amber-600 transition-colors"
              >
                {post.profiles?.pen_name}
              </Link>
              <p className="text-sm text-gray-500">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-2 z-10 min-w-[120px]">
                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Flag className="h-4 w-4" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {formatContent(post.content)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading || !user}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>

          <div className="text-sm text-gray-500">
            {post.reports_count > 0 && (
              <span className="text-red-500">
                {post.reports_count} report{post.reports_count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        post={post}
        onReportSubmitted={() => {
          setShowReportModal(false)
          onPostUpdate?.()
        }}
      />
    </>
  )
}