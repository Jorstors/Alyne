import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Plus, Search, MoreHorizontal, Settings, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    async function fetchTeams() {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/teams?user_id=${user?.id}`)
        if (res.ok) {
            const data = await res.json()
            setTeams(data)
        }
      } catch (err) {
        console.error('Teams fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [user?.id])

  if (loading) {
      return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

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
        {teams.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No teams yet</h3>
                <p className="text-muted-foreground mb-4">Create a team to start scheduling recurring events.</p>
                <Link to="/teams/new">
                    <Button>Create Your First Team</Button>
                </Link>
            </div>
        ) : (
            teams.map(team => (
                <TeamCard
                    key={team.id}
                    team={team}
                    role={team.role === 'admin' ? 'Leader' : 'Member'}
                />
            ))
        )}
      </div>
    </>
  )
}

function TeamCard({ team, role }: { team: any, role: string }) {
  // We need to fetch team members count if not provided, for now hardcode 1 or fetch
  // The list endpoint returns minimal data. Let's assume just showing name/role is fine for MVP.

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link to={`/teams/${team.id}`} className="flex items-start gap-4 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-sm text-muted-foreground">Team</p>
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
                <DropdownMenuItem className="text-destructive">Leave team</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
               View Details
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
