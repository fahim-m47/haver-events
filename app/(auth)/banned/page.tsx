import Link from 'next/link'

export default function BannedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold text-red-500">Account Suspended</h1>
        <p className="text-zinc-400 max-w-md">
          Your account has been suspended due to a violation of our community guidelines.
          If you believe this is a mistake, please contact the administrators.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
