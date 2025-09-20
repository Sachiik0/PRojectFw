import AuthForms from '@/components/AuthForms'

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md paper-texture">
        <AuthForms mode="signup" />
      </div>
    </div>
  )
}
