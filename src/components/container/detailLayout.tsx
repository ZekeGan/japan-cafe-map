'use client'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Footer from '@/components/footer'
import { useRouter } from 'next/navigation'

const DetailLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  return (
    <main className="h-screen flex flex-col">
      <section className="border-b-2 px-4 py-1 flex align-middle">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => router.back()}
        >
          <ChevronLeft />
        </Button>
      </section>

      <section className="flex-1 ">{children}</section>

      <div className="min-h-14" />
      <section className="fixed bottom-0 left-0 w-screen">
        <Footer />
      </section>
    </main>
  )
}

export default DetailLayout
