import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Footer from '@/components/footer'

const DetailLayout = ({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) => {
  return (
    <main className="h-screen flex flex-col">
      <section className="border-b-2 px-4 py-1 flex align-middle">
        <Button
          variant="ghost"
          size="icon-lg"
        >
          <Link href={href}>
            <ChevronLeft />
          </Link>
        </Button>
      </section>

      <section className="flex-1">{children}</section>

      <section className="fixed bottom-0 left-0 w-full">
        <Footer />
      </section>
    </main>
  )
}

export default DetailLayout
