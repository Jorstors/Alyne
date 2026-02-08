import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  children?: React.ReactNode
  showNav?: boolean
  className?: string
}

interface SidebarContentProps {
  user: any
  showNav: boolean
  isActive: (path: string) => boolean
  onNavItemClick?: () => void
  children?: React.ReactNode
  handleSignOut: () => void
}

const SidebarContent = ({ user, showNav, isActive, onNavItemClick, children, handleSignOut }: SidebarContentProps) => {
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'JD'
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="hidden md:flex items-center mb-10 px-2" onClick={onNavItemClick}>
        <img src="/alyne-logo.svg" alt="Alyne" className="h-7" />
      </Link>

      {showNav && (
        <nav className="space-y-1 mb-8">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            active={isActive('/dashboard')}
            onClick={onNavItemClick}
          />
          <NavItem
            href="/teams"
            icon={<Users className="h-4 w-4" />}
            label="Teams"
            active={isActive('/teams')}
            onClick={onNavItemClick}
          />
          <NavItem
            href="/events"
            icon={<Calendar className="h-4 w-4" />}
            label="Events"
            active={isActive('/events')}
            onClick={onNavItemClick}
          />
        </nav>
      )}

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {children}
      </div>

      {user && (
        <div className="pt-6 border-t border-border mt-auto">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative">
                      <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-sm font-semibold truncate max-w-[100px]">{displayName}</span>
                       <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{user.email}</span>
                  </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleSignOut} title="Log out">
                  <LogOut className="h-4 w-4" />
              </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ children, showNav = true, className }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[60] border-b border-border bg-background/95 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-7" />
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background border-t border-border p-6 overflow-y-auto">
          <SidebarContent
            user={user}
            showNav={showNav}
            isActive={isActive}
            onNavItemClick={() => setMobileMenuOpen(false)}
            handleSignOut={handleSignOut}
          >
            {children}
          </SidebarContent>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 border-r border-border/40 bg-card p-6 flex flex-col hidden md:flex z-50",
        className
      )}>
        <SidebarContent
            user={user}
            showNav={showNav}
            isActive={isActive}
            handleSignOut={handleSignOut}
        >
            {children}
        </SidebarContent>
      </aside>
    </>
  )
}

function NavItem({
  href,
  icon,
  label,
  active = false,
  onClick
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
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
