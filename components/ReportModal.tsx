'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Post } from '@/lib/types'

const reportSchema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
})

type ReportForm = z.infer<typeof reportSchema>

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  onReportSubmitted?: () => void
}

const reportReasons = [
  'Spam or misleading content',
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Violence or threats',
  'Sexual or inappropriate content',
  'Copyright infringement',
  'Other'
]

export function ReportModal({ isOpen, onClose, post, onReportSubmitted }: ReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: '',
    },
  })

  const handleSubmit = async (data: ReportForm) => {
    if (!user) {
      setError('You must be signed in to report')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: post.id,
          reason: data.reason,
        })

      if (reportError) {
        if (reportError.code === '23505') { // Unique constraint violation
          setError('You have already reported this post')
        } else {
          setError('Failed to submit report')
        }
        return
      }

      // Update post's report count
      await supabase
        .from('posts')
        .update({ 
          reports_count: post.reports_count + 1 
        })
        .eq('id', post.id)

      setSuccess(true)
      setTimeout(() => {
        onReportSubmitted?.()
        onClose()
        setSuccess(false)
        form.reset()
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="bg-green-500 p-2 rounded-full">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Report Submitted</h4>
            <p className="text-gray-600">
              Thank you for helping keep our community safe. We'll review this report shortly.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Help us understand what's wrong with this post. Your report will be reviewed by our team.
            </p>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <label key={reason} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value={reason}
                        {...form.register('reason')}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.reason.message}</p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}