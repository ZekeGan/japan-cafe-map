import Footer from '@/components/footer'
import DetailLayout from '@/components/container/detailLayout'
import { MAP } from '@/constant/router'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DetailLayout href={MAP}>
      <div className="h-full flex flex-col justify-center px-4">{children}</div>
    </DetailLayout>
  )
}

export default Layout
