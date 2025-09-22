// app/not-found.tsx
import { User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-8 paper-texture">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or may have been removed.
        </p>
        <Link href="/">
          <Button>
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
