import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Clock, ArrowRight, MoreHorizontal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function DashboardPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    async function fetchData() {
      try {
        setLoading(true)
        // Fetch specific data for dashboard
        // In a real app we might want dedicated dashboard endpoints or use Promise.all
        const [eventsRes, teamsRes] = await Promise.all([
            fetch(`${API_URL}/events?user_id=${user?.id}`),
            fetch(`${API_URL}/teams?user_id=${user?.id}`)
        ])

        if (eventsRes.ok) {
            const data = await eventsRes.json()
            setEvents(data.slice(0, 3)) // Top 3
        }
        if (teamsRes.ok) {
            const data = await teamsRes.json()
            setTeams(data.slice(0, 2)) // Top 2
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading) {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
           {/* Header Skeleton */}
           <div className="mb-8 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
           </div>

           {/* Quick Actions Skeleton */}
           <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Skeleton className="h-32 rounded-xl border-2 border-slate-100" />
              <Skeleton className="h-32 rounded-xl border-2 border-slate-100" />
           </div>

           {/* Upcoming Events Skeleton */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
           </div>

           {/* Teams Skeleton */}
           <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-16" />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <Skeleton className="h-32 w-full rounded-xl" />
                 <Skeleton className="h-32 w-full rounded-xl" />
              </div>
           </div>
        </div>
      )
  }

  // Helper to safely get first name
  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there'

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground">Here's what's happening with your teams.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 relative z-10">
        <Link to="/teams/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-sketch border-2 border-slate-900 bg-white/50 h-full group">
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
        <Link to="/create">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-sketch border-2 border-slate-900 bg-white/50 h-full group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Event</h3>
                <p className="text-sm text-muted-foreground">One-off poll without a team</p>
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

        {events.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground mb-4">No upcoming events found.</p>
                <Link to="/create"><Button variant="outline">Create Event</Button></Link>
            </div>
        ) : (
            <div className="space-y-4 relative z-10">
            {events.map(event => (
                 <EventCard
                    key={event.id}
                    title={event.title}
                    team={event.team_id ? 'Team Event' : 'Personal Event'} // We'd need to fetch team name in a join ideally
                    date={event.created_at} // TODO: Use actual start date
                    id={event.id}
                />
            ))}
            </div>
        )}
      </section>

      {/* Your Teams */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Teams</h2>
          <Link to="/teams" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {teams.length === 0 ? (
             <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground mb-4">You haven't joined any teams yet.</p>
                <Link to="/teams/new"><Button variant="outline">Create Team</Button></Link>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {teams.map(team => (
                <TeamCard
                    key={team.id}
                    id={team.id}
                    name={team.name}
                    members={1} // TODO: Fetch count
                    events={0}
                />
            ))}
            </div>
        )}
      </section>
    </>
  )
}

function EventCard({ title, team, date, id }: { title: string; team: string; date: string; id: string }) {
    let displayDate = date
    try {
        displayDate = format(parseISO(date), 'MMM d, h:mm a')
    } catch (e) {}

  return (
    <Link to={`/event/${id}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{team} · {displayDate}</p>
            </div>
            </div>
            <div className="flex items-center gap-4">
            {/* <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{responses}</span>/{total} responded
            </div> */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            </div>
        </CardContent>
        </Card>
    </Link>
  )
}

function TeamCard({ id, name, members, events }: { id: string; name: string; members: number; events: number }) {
  return (
    <Link to={`/teams/${id}`} className="block">
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
    </Link>
  )
}
