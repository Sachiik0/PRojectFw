'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'  // ✅ use supabase directly
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PenTool, Send } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

const postSchema = z.object({
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(2000, 'Content must be less than 2000 characters'),
})

type PostForm = z.infer<typeof postSchema>

interface PostFormProps {
  onPostCreated?: () => void
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const { user, profile } = useAuth()
  // ❌ remove `createClient()` — not needed

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
    },
  })

  const watchedContent = form.watch('content')

  const handleSubmit = async (data: PostForm) => {
    if (!user || !profile) {
      setError('You must be signed in to post')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: data.content.trim(),
        })

      if (postError) {
        setError('Failed to create post')
        return
      }

      // Update user's post count
      await supabase
        .from('profiles')
        .update({ 
          posts_count: profile.posts_count + 1 
        })
        .eq('id', user.id)

      form.reset()
      onPostCreated?.()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 paper-texture">
        <div className="text-center py-8">
          <PenTool className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Share Your Thoughts</h3>
          <p className="text-gray-600 mb-4">
            Join the freedom wall to share your poems, thoughts, and stories
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button onClick={() => window.location.href = '/signup'}>
              Join Wall
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 paper-texture">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-amber-100 p-2 rounded-full">
          <PenTool className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">What's on your mind, {profile.pen_name}?</h3>
          <p className="text-sm text-gray-600">Share your thoughts with the world</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <Textarea
            {...form.register('content')}
            placeholder="Write your poem, story, thought, or anything that moves you..."
            className="min-h-[120px] resize-none border-amber-200 focus:border-amber-400 focus:ring-amber-200"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {form.formState.errors.content && (
                <span className="text-red-500">{form.formState.errors.content.message}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {watchedContent.length}/2000
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || !watchedContent.trim()}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Post to Wall</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
