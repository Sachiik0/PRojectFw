// app/profile/[penName]/page.tsx
import { UserProfile } from '@/components/UserProfile'

interface ProfilePageProps {
  params: Promise<{
    penName: string
  }>
}

export default async function Page({ params }: ProfilePageProps) {
  const { penName } = await params
  return <UserProfile penName={penName} />
}
