import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInHours = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return formatDistanceToNow(targetDate, { addSuffix: true })
  } else {
    return format(targetDate, 'MMM d, yyyy')
  }
}

export function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generatePenName(email: string, userId: string): string {
  const username = email.split('@')[0]
  const shortId = userId.substring(0, 8)
  return `${username}_${shortId}`
}