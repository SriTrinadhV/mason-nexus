import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Topbar from './Topbar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-[#f7f8f6]">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-20 pt-4 lg:px-6 lg:pb-8 lg:pt-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
