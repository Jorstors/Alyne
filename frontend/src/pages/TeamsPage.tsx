import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Plus, Search, MoreHorizontal, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TeamsPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Teams</h1>
          <p className="text-muted-foreground">Manage your scheduling groups</p>
        </div>
        <Link to="/teams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Team</span>
            <span className="sm:hidden">New</span>
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
    </>
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
