import Footer from '@/components/footer'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex h-screen flex-col ">
      <section className="flex-1">{children}</section>

      <section className="fixed bottom-0 left-0 w-full">
        <Footer />
      </section>
    </main>
  )
}

export default Layout
