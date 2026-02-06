import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'

export function AuthenticatedLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } })
    }
  }, [user, loading, navigate, location])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 min-w-0 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
             <Outlet />
        </div>
      </main>
    </div>
  )
}
