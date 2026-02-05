import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Users, Plus, Search, MoreHorizontal, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TeamsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col">
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Teams</h1>
              <p className="text-muted-foreground">Manage your scheduling groups</p>
            </div>
            <Link to="/teams/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Team
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teams..." className="pl-10" />
          </div>

          {/* Teams Grid */}
          <div className="grid gap-4">
            <TeamCard
              name="Engineering Team"
              description="Weekly standups and sprint planning"
              members={[
                { name: "John D", avatar: "" },
                { name: "Jane S", avatar: "" },
                { name: "Mike R", avatar: "" },
                { name: "Sarah K", avatar: "" },
              ]}
              moreMembers={2}
              events={3}
              role="Leader"
            />
            <TeamCard
              name="Design Team"
              description="Design reviews and brainstorming sessions"
              members={[
                { name: "Alex P", avatar: "" },
                { name: "Chris M", avatar: "" },
                { name: "Dana L", avatar: "" },
              ]}
              moreMembers={1}
              events={2}
              role="Member"
            />
            <TeamCard
              name="Marketing"
              description="Campaign planning and content reviews"
              members={[
                { name: "Sam W", avatar: "" },
                { name: "Taylor B", avatar: "" },
              ]}
              moreMembers={0}
              events={1}
              role="Member"
            />
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

interface TeamCardProps {
  name: string
  description: string
  members: { name: string; avatar: string }[]
  moreMembers: number
  events: number
  role: 'Leader' | 'Member'
}

function TeamCard({ name, description, members, moreMembers, events, role }: TeamCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link to="/teams/engineering" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              role === 'Leader'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {role}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>View members</DropdownMenuItem>
                <DropdownMenuItem>Copy invite link</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Leave team</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.map((member, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
              {moreMembers > 0 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                  +{moreMembers}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {members.length + moreMembers} members
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {events} upcoming {events === 1 ? 'event' : 'events'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
