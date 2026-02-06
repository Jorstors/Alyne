import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users, Menu, X, LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export function AuthenticatedLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path: string) => {
      // Exact match for dashboard, startswith for others
      if (path === '/dashboard') return location.pathname === '/dashboard'
      return location.pathname.startsWith(path)
  }

  // Helper to get initials
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'JD'
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
         <Link to="/" className="flex items-center">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
         </Link>
         <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
         </Button>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 z-40 bg-background border-t border-border p-4">
              <nav className="space-y-2">
                 <MobileNavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />} label="Dashboard" active={isActive('/dashboard')} onClick={() => setMobileMenuOpen(false)} />
                 <MobileNavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" active={isActive('/teams')} onClick={() => setMobileMenuOpen(false)} />
                 <MobileNavItem href="/events" icon={<Calendar className="h-4 w-4" />} label="Events" active={isActive('/events')} onClick={() => setMobileMenuOpen(false)} />
              </nav>
              <div className="mt-8 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={avatarUrl} />
                       <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      Sign out
                  </Button>
              </div>
          </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex-col">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>

        <nav className="space-y-1 flex-1">
          <NavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />} label="Dashboard" active={isActive('/dashboard')} />
          <NavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" active={isActive('/teams')} />
          <NavItem href="/events" icon={<Calendar className="h-4 w-4" />} label="Events" active={isActive('/events')} />
        </nav>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
               <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* md:ml-64 ensures space for sidebar on desktop */}
      <main className="flex-1 md:ml-64 min-w-0 pt-14 md:pt-0">
          {/* p-4 mobile, p-8 desktop */}
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
             <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavItem({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
    return (
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {icon}
        {label}
      </Link>
    )
  }
