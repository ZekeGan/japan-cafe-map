import { MAP } from '@/constant/router'
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect(MAP)
  return null
}
