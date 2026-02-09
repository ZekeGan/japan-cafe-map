import Footer from '@/components/footer'
import DetailLayout from '@/components/container/detailLayout'
import { MAP } from '@/constant/router'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <DetailLayout href={MAP}>{children}</DetailLayout>
}

export default Layout
