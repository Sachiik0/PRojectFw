// app/profile/[penName]/page.tsx

import { UserProfile } from '@/components/UserProfile'

interface ProfilePageProps {
  params: {
    penName: string
  }
}

export default function Page({ params }: ProfilePageProps) {
  return <UserProfile penName={params.penName} />
}
