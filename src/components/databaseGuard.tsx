import { prisma } from '@/lib/db'

export default async function DatabaseGuard({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await prisma.$runCommandRaw({
      ping: 1,
    })
  } catch (error) {
    console.error('❌ MongoDB is unavailable:', error)

    return (
      <html lang="en">
        <body>
          <main
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <p>
              The database is currently unavailable. Please try again later.
            </p>
          </main>
        </body>
      </html>
    )
  }

  return children
}
