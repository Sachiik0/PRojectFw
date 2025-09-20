import { UserProfile } from '@/components/UserProfile'

interface ProfilePageProps {
  params: {
    penName: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <UserProfile penName={decodeURIComponent(params.penName)} />
}