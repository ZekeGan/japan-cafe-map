'use client'

import { useAuth } from '@/context/authContext'
import { Heart, House, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { HOME, LOGIN, MAP, PROFILE } from '@/constant/router'

const Footer = () => {
  const { user } = useAuth()

  return (
    <footer className="bg-white shadow-sm z-10 grid grid-cols-3 py-1">
      <Link
        href={MAP}
        className="flex flex-col items-center gap-1"
      >
        <House className="w-5" />
        <div className="text-xs font-bold">地圖</div>
      </Link>
      {user ? (
        <>
          <Link
            href={HOME}
            className="flex flex-col items-center gap-1"
          >
            <Heart className="w-5" />
            <div className="text-xs font-bold">最愛</div>
          </Link>

          <Link
            href={PROFILE}
            className="flex flex-col items-center gap-1"
          >
            <User className="w-5" />
            <div className="text-xs font-bold">我</div>
          </Link>
        </>
      ) : (
        <Link href={LOGIN}>
          <div className="text-xs font-bold">Login</div>
        </Link>
      )}
    </footer>
  )
}

export default Footer
