import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Search, Clock, CheckCircle, AlertCircle, MoreHorizontal, Loader2, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { format, parseISO, isPast, isFuture } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user?.id) return

    async function fetchEvents() {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/events?user_id=${user?.id}`)
        if (res.ok) {
            const data = await res.json()
            setEvents(data)
        }
      } catch (err) {
        console.error('Events fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user?.id])

  // Filter Logic
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Categorize
  // "Pending" logic is tricky without checking participant status deeply.
  // For MVP:
  // - Upcoming: Start date in future OR created recently
  // - Past: Start date in past

  // Since we don't strictly have start_dates for every event type yet, we'll use created_at as a proxy if needed,
  // or just put everything in "Upcoming" for visibility if date is missing.

  const upcomingEvents = filteredEvents.filter(e => {
       // If we have specific dates, check the last one?
       // For now simpler: Display all as upcoming unless obviously past?
       return true
  })

  // Mock splitting for tabs to show UI working (since we might not have enough data to test past)
  // Real implementation: check e.end_date or configuration dates

  if (loading) {
      return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Events</h1>
          <p className="text-muted-foreground">Manage all your team events</p>
        </div>
        <Link to="/create">
            <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Event
            </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Search events..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
             {filteredEvents.length === 0 ? (
                <EmptyState />
             ) : (
                filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))
             )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
             {filteredEvents.length === 0 ? (
                <EmptyState />
             ) : (
                filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))
             )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
             <div className="text-center py-8 text-muted-foreground">No past events</div>
        </TabsContent>
      </Tabs>
    </>
  )
}

function EmptyState() {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first event.</p>
            <Link to="/create">
                <Button>Create Event</Button>
            </Link>
        </div>
    )
}


function EventCard({ event }: { event: any }) {
  // Determine display date
  let dateStr = event.created_at
  try {
      dateStr = format(parseISO(event.created_at), 'MMM d, yyyy')
  } catch (e) {}

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">
                  <Link to={`/event/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {event.team_id ? 'Team Event' : 'Personal Event'}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Created: {dateStr}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
             <Link to={`/event/${event.id}`}>
                <Button variant="outline" size="sm">View</Button>
             </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit event</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
