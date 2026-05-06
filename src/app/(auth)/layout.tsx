import DetailLayout from '@/components/container/detailLayout'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DetailLayout>
      <div className="h-full flex flex-col justify-center px-4">{children}</div>
    </DetailLayout>
  )
}

export default Layout
