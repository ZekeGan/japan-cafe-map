import Header from '@/components/header'

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container relative min-h-screen ">
      <Header />
      <div className="">{children}</div>
    </div>
  )
}

export default LoginLayout
