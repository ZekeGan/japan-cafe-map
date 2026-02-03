import { useAuth } from '@/context/authContext'
import Link from 'next/link'

const Header = () => {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
      <h1 className="text-xl font-bold text-gray-800">Cafe Finder</h1>
      {user?.id ? (
        <div>
          <div>TEST</div>
        </div>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </header>
  )
}

export default Header
