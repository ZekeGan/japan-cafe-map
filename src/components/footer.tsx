import { useAuth } from '@/context/authContext'
import { Heart, House, User } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
  const { user } = useAuth()

  return (
    <footer className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
      <Link
        href="/"
        className="text-sm"
      >
        <div className=" flex flex-col items-center">
          <House />
          <div className="text-xs font-bold">地圖</div>
        </div>
      </Link>
      {user?.id ? (
        <>
          <Link
            href="/favorite"
            className="text-sm"
          >
            <div className=" flex flex-col items-center">
              <Heart />
              <div className="text-xs font-bold">我的最愛</div>
            </div>
          </Link>
          <Link
            href="/favorite"
            className="text-sm"
          >
            <div className=" flex flex-col items-center">
              <User />
              <div className="text-xs font-bold">我</div>
            </div>
          </Link>
        </>
      ) : (
        <Link href="/login">
          <div className="text-xs font-bold">Login</div>
        </Link>
      )}
    </footer>
  )
}

export default Footer
