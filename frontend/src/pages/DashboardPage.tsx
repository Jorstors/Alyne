import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users, Plus, Clock, ArrowRight, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>

        <nav className="space-y-1 flex-1">
          <NavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />} label="Dashboard" active />
          <NavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" />
          <NavItem href="/events" icon={<Calendar className="h-4 w-4" />} label="Events" />
        </nav>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's what's happening with your teams.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">


            <Link to="/teams/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Team</h3>
                    <p className="text-sm text-muted-foreground">Start a new scheduling group</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Upcoming Events */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              <EventCard
                title="Weekly Standup"
                team="Engineering Team"
                date="Tomorrow at 10:00 AM"
                responses={5}
                total={6}
              />
              <EventCard
                title="Project Kickoff"
                team="Design Team"
                date="Feb 5 at 2:00 PM"
                responses={3}
                total={4}
              />
              <EventCard
                title="Sprint Planning"
                team="Engineering Team"
                date="Feb 8 at 9:00 AM"
                responses={2}
                total={6}
              />
            </div>
          </section>

          {/* Your Teams */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Teams</h2>
              <Link to="/teams" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TeamCard
                name="Engineering Team"
                members={6}
                events={3}
              />
              <TeamCard
                name="Design Team"
                members={4}
                events={2}
              />
            </div>
          </section>
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

function EventCard({ title, team, date, responses, total }: { title: string; team: string; date: string; responses: number; total: number }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{team} · {date}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{responses}</span>/{total} responded
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit event</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamCard({ name, members, events }: { name: string; members: number; events: number }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {members} members
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {events} events
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
