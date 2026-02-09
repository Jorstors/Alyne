import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // New import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Search, Clock, MoreHorizontal, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Action States
  const [deletingEvent, setDeletingEvent] = useState<any>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Edit Form State
  const [editForm, setEditForm] = useState({ title: '', description: '' })

  const handleDeleteClick = (event: any) => {
      setDeletingEvent(event)
  }

  const confirmDelete = async () => {
      if (!deletingEvent) return
      try {
          setActionLoading(true)
          const res = await fetch(`${API_URL}/events/${deletingEvent.id}?user_id=${user?.id}`, {
              method: 'DELETE'
          })

          if (!res.ok) throw new Error('Failed to delete')

          // Update UI
          setEvents(prev => prev.filter(e => e.id !== deletingEvent.id))
          setDeletingEvent(null)
      } catch (err) {
          console.error(err)
          alert('Failed to delete event')
      } finally {
          setActionLoading(false)
      }
  }

  const handleEditClick = (event: any) => {
      setEditingEvent(event)
      setEditForm({
          title: event.title,
          description: event.description || ''
      })
  }

  const saveEdit = async () => {
      if (!editingEvent) return
      try {
          setActionLoading(true)
          const res = await fetch(`${API_URL}/events/${editingEvent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...editForm,
                  user_id: user?.id
              })
          })

          if (!res.ok) throw new Error('Failed to update')

          const updatedEvent = await res.json()

          // Update UI
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...updatedEvent } : e))
          setEditingEvent(null)
      } catch (err) {
          console.error(err)
          alert('Failed to update event')
      } finally {
          setActionLoading(false)
      }
  }

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



  // Mock splitting for tabs to show UI working (since we might not have enough data to test past)
  // Real implementation: check e.end_date or configuration dates

  if (loading) {
      return (
        <div className="space-y-8">
           <div className="flex justify-between items-start">
               <div className="space-y-2">
                   <Skeleton className="h-8 w-32" />
                   <Skeleton className="h-4 w-48" />
               </div>
               <Skeleton className="h-10 w-32 rounded-md" />
           </div>

           <Skeleton className="h-10 w-full rounded-md" />

           <div className="space-y-2">
               <Skeleton className="h-10 w-64 rounded-md" />
           </div>

           <div className="space-y-8">
               <Skeleton className="h-40 w-full rounded-xl" />
               <Skeleton className="h-40 w-full rounded-xl" />
           </div>
        </div>
      )
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

        <TabsContent value="all" className="space-y-4 relative z-10">
             {filteredEvents.length === 0 ? (
                <EmptyState />
             ) : (
                filteredEvents.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onEdit={() => handleEditClick(event)}
                        onDelete={() => handleDeleteClick(event)}
                        currentUserId={user?.id}
                    />
                ))
             )}
        </TabsContent>
        {/* Simplified tabs for now - reusing same content or logic as needed */}
        <TabsContent value="upcoming" className="space-y-4 relative z-10">
             {filteredEvents.filter(e => new Date(e.created_at) > new Date(Date.now() - 86400000)).map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onEdit={() => handleEditClick(event)}
                        onDelete={() => handleDeleteClick(event)}
                        currentUserId={user?.id}
                    />
             ))}
             {filteredEvents.filter(e => new Date(e.created_at) > new Date(Date.now() - 86400000)).length === 0 && <div className="text-center py-8 text-muted-foreground">No upcoming events found</div>}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
             <div className="text-center py-8 text-muted-foreground">No past events</div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete "{deletingEvent?.title}"? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setDeletingEvent(null)} disabled={actionLoading}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={actionLoading}>
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                    Update the details for "{editingEvent?.title}".
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Weekly Standup"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add a description..."
                        className="min-h-[100px]"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingEvent(null)} disabled={actionLoading}>Cancel</Button>
                <Button onClick={saveEdit} disabled={actionLoading}>
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
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


function EventCard({ event, onEdit, onDelete, currentUserId }: { event: any, onEdit: () => void, onDelete: () => void, currentUserId: string | undefined }) {
  // Determine display date
  let dateStr = event.display_date || event.created_at
  try {
      if (dateStr.includes('T')) {
         dateStr = format(parseISO(dateStr), 'MMM d, yyyy')
      } else {
         dateStr = format(parseISO(dateStr), 'MMM d, yyyy')
      }
  } catch (e) {}

  const isOwner = event.created_by === currentUserId

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
                  {/* If it's created_at, say Created:, else say Date: */}
                  {dateStr === event.display_date ? 'Date: ' : 'Created: '}
                  {dateStr}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
             <Link to={`/event/${event.id}`}>
                <Button variant="outline" size="sm">View</Button>
             </Link>

             {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
