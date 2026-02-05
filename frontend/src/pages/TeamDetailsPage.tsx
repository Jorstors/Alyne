import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, Plus, Search, ArrowLeft, MoreHorizontal, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function TeamDetailsPage() {
  const { id } = useParams()
  // Mock team data based on ID
  const teamName = id === 'engineering' ? 'Engineering Team' : 'Marketing Team'
  const memberCount = id === 'engineering' ? 6 : 4

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col hidden md:flex">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>

        <nav className="space-y-1 flex-1">
          <NavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" active />
          <NavItem href="/events" icon={<Calendar className="h-4 w-4" />} label="Events" />
        </nav>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8">
               <AvatarFallback>JD</AvatarFallback>
             </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Justus</p>
              <p className="text-xs text-muted-foreground truncate">justus@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Teams
            </Link>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{teamName}</h1>
                        <p className="text-muted-foreground">{memberCount} members • Public Team</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline">Manage Members</Button>
                     <Link to={`/create?teamId=${id || 'engineering'}`}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Team Event
                        </Button>
                     </Link>
                </div>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Team Events</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search events..." className="pl-10" />
                </div>
             </div>

             <div className="grid gap-4">
                <EventCard
                  id="123"
                  title="Weekly Sync"
                  date="Tomorrow, 10:00 AM"
                  status="finalized"
                  responses={memberCount}
                  total={memberCount}
                />
                <EventCard
                  id="456"
                  title="Project Kickoff"
                  date="Feb 20, 2025"
                  status="pending"
                  responses={2}
                  total={memberCount}
                />
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

function EventCard({ id, title, date, status, responses, total }: { id: string; title: string; date: string; status: 'pending' | 'finalized'; responses: number; total: number }) {
  const isFinal = status === 'finalized'
  return (
    <Link to={`/event/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isFinal ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {isFinal ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
             </div>
             <div>
                <h3 className="font-medium text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{date}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="text-right">
                  <div className="text-sm font-medium">{responses}/{total} responded</div>
                  <div className="text-xs text-muted-foreground capitalize">{status}</div>
              </div>
               <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
