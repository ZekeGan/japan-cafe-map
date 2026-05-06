/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useAuth } from '@/context/authContext'
import { Heart, House, LogIn, User } from 'lucide-react'
import Link from 'next/link'
import { FAVOTITE, LOGIN, MAP, PROFILE } from '@/constant/router'
import { cloneElement, ReactElement } from 'react'
import { useTranslation } from '@/context/languageContext'

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
      className="flex flex-col items-center gap-1 active:scale-95 transition"
    >
      {cloneElement(icon, {
        className: 'w-5',
      } as any)}
      <div className="text-xs font-bold">{label}</div>
    </Link>
  )
}

const Footer = () => {
  const { t } = useTranslation() // 初始化翻譯功能
  const { user } = useAuth()

  return (
    <footer className="bg-white shadow-sm z-10 grid grid-cols-3 py-1 h-13">
      <Item
        href={MAP}
        label={t.common.map}
        icon={<House />}
      />

      {user ? (
        <>
          <Item
            href={FAVOTITE}
            label={t.common.favorite}
            icon={<Heart />}
          />
          <Item
            href={PROFILE}
            label={t.common.profile}
            icon={<User />}
          />
        </>
      ) : (
        <>
          <div />
          <Item
            href={LOGIN}
            label={t.common.login}
            icon={<LogIn />}
          />
        </>
      )}
    </footer>
  )
}

export default Footer
