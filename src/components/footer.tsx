/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useAuth } from '@/context/authContext'
import { Heart, House, LogIn, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { FAVOTITE, HOME, LOGIN, MAP, PROFILE } from '@/constant/router'
import { cloneElement, ElementType, ReactElement, ReactNode } from 'react'

const Item = ({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactElement
}) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1"
    >
      {/* 使用 as any 避開屬性檢查 */}
      {cloneElement(icon, {
        className: 'w-5',
      } as any)}
      <div className="text-xs font-bold">{label}</div>
    </Link>
  )
}

const Footer = () => {
  const { user } = useAuth()

  return (
    <footer className="bg-white shadow-sm z-10 grid grid-cols-3 py-1">
      <Item
        href={MAP}
        label="地圖"
        icon={<House />}
      />

      {user ? (
        <>
          <Item
            href={FAVOTITE}
            label="最愛"
            icon={<Heart />}
          />
          <Item
            href={PROFILE}
            label="我"
            icon={<User />}
          />
        </>
      ) : (
        <>
          <div />
          <Item
            href={LOGIN}
            label="登入"
            icon={<LogIn />}
          />
        </>
      )}
    </footer>
  )
}

export default Footer
