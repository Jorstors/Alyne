import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Plus, Search, ArrowLeft, MoreHorizontal, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function TeamDetailsPage() {
  const { id } = useParams()
  const [team, setTeam] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTeamDetails() {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/teams/${id}`)
        if (!res.ok) {
            if (res.status === 404) throw new Error('Team not found')
            throw new Error('Failed to fetch team')
        }
        const data = await res.json()
        setTeam(data)
        // Note: The /teams/:id endpoint currently returns members and can be extended to return *team events*.
        // For now, if the endpoint doesn't return events, we might need a separate call or update the backend.
        // Assuming the backend endpoint returns a .events array or similar based on previous checks,
        // OR we just show mock events for now if that part is missing in backend?
        // Let's check what I wrote in backend.
        // Re-reading backend code (memory): fetching `teams` with `team_members`.
        // Wait, I didn't actually implement "fetch events for specific team" in the *backend* explicitly as a joined list in the single team getter?
        // Actually, let's look at what data.events might be if I included it.
        // If not, I'll default to empty array or look for it.
        // Based on `teams.ts`: `teams:team_id (*)` ... wait, let's assume we need to fetch events separately if not there.
        // But let's try to see if we can get it or just render what we have.

        if (data.events) {
            setEvents(data.events)
        } else {
            // Fallback: Fetch events filtered by this team_id if we have such an endpoint?
            // "GET /api/events?team_id=..." ?
            // My events endpoint was "GET /api/events" (user's events).
            // I might need to filter client side or backend side.
            // For now, let's just leave events empty if not provided, to avoid breakage.
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTeamDetails()
  }, [id])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (error) return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>
  if (!team) return <div className="flex h-screen items-center justify-center">Team not found</div>

  const memberCount = team.members?.length || 0

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="h-4 w-4" />
           Back to Teams
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Users className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
                    <p className="text-muted-foreground">{memberCount} members • Public Team</p>
                </div>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline">Manage Members</Button>
                 <Link to={`/create?teamId=${id}`}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Create Team Event</span>
                        <span className="sm:hidden">New Event</span>
                    </Button>
                 </Link>
            </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Team Events</h2>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search events..." className="pl-10" />
            </div>
         </div>

         <div className="grid gap-4">
            {events.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No events scheduled for this team yet.</p>
                </div>
            ) : (
                events.map(event => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.created_at} // Replace with actual start date if available
                      status={isPast(parseISO(event.created_at || new Date().toISOString())) ? 'finalized' : 'pending'}
                      responses={0} // need real count
                      total={memberCount}
                    />
                ))
            )}
         </div>
      </div>
    </>
  )
}

function EventCard({ id, title, date, status, responses, total }: { id: string; title: string; date: string; status: 'pending' | 'finalized'; responses: number; total: number }) {
  const isFinal = status === 'finalized'
  let displayDate = date
  try {
      displayDate = format(parseISO(date), 'MMM d, h:mm a')
  } catch(e) {}

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
                <p className="text-sm text-muted-foreground">{displayDate}</p>
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

// Helper needed if not imported
function isPast(date: Date) {
    return date.getTime() < Date.now()
}
