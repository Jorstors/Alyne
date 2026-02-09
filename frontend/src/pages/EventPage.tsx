import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

import { useAuth } from '@/components/AuthProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sidebar } from '@/components/Sidebar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader2, Copy, Check, Users, ArrowLeft, MoreHorizontal, Edit2, Trash2, Calendar } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function EventPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null)

  // Edit/Delete State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '' })

  const handleEditClick = () => {
      setEditForm({
          title: eventData?.title || '',
          description: eventData?.description || ''
      })
      setIsEditOpen(true)
  }

  const saveEdit = async () => {
      if (!eventData?.id) return
      try {
          setActionLoading(true)
          const res = await fetch(`${API_URL}/events/${eventData.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...editForm,
                  user_id: user?.id
              })
          })
          if (!res.ok) throw new Error('Failed to update event')
          const updated = await res.json()
          setEventData((prev: any) => ({ ...prev, ...updated }))
          setIsEditOpen(false)
      } catch (e) {
          console.error(e)
          alert('Failed to update event')
      } finally {
          setActionLoading(false)
      }
  }

  const confirmDelete = async () => {
      if (!eventData?.id) return
      try {
          setActionLoading(true)
          const res = await fetch(`${API_URL}/events/${eventData.id}?user_id=${user?.id}`, {
              method: 'DELETE'
          })
          if (!res.ok) throw new Error('Failed to delete event')
          // Redirect to dashboard
          window.location.href = '/dashboard'
      } catch (e) {
          console.error(e)
          alert('Failed to delete event')
          setActionLoading(false)
      }
  }

  // Calendar Export Logic
  const getEventDates = () => {
      if (!eventData?.configuration) return null;
      const { startTime, endTime } = eventData.configuration;
      let start = new Date();

      // Determine the single "next" date to allow adding to calendar.
      // For multi-date events, we usually just add the first one or next upcoming one.

      if (eventData.event_type === 'specific_dates' && eventData.configuration.dates?.length) {
          const dates = eventData.configuration.dates.sort();
          const nowStr = new Date().toISOString().split('T')[0];
          const nextDate = dates.find((d: string) => d >= nowStr) || dates[dates.length - 1];
          start = parseISO(nextDate);
      } else if (eventData.event_type === 'days_of_week' && eventData.configuration.days?.length) {
          // Find next occurrence (simplification)
          // Just use today for now if it matches, or upcoming.
          // Actually, let's just default to today/tomorrow logic if simple.
          // For MVP, if it's weekly, just set it for the next occurrence of the first day in list.
          start = new Date(); // TODO: Better logic for weekly
      }

      // Set times
      if (startTime) {
          const [sh, sm] = startTime.split(':').map(Number);
          start.setHours(sh, sm, 0, 0);
      }

      const end = new Date(start);
      if (endTime) {
          const [eh, em] = endTime.split(':').map(Number);
          end.setHours(eh, em, 0, 0);
      } else {
          end.setHours(start.getHours() + 1); // Default 1h
      }

      return { start, end };
  }

  const addToGoogleCalendar = () => {
      const dates = getEventDates();
      if (!dates) return;
      const { start, end } = dates;

      const text = encodeURIComponent(eventData.title || 'Event');
      const details = encodeURIComponent(eventData.description || '');
      // Format: YYYYMMDDTHHmmss
      const formatGCal = (d: Date) => d.toISOString().replace(/[-:.]/g, '').split('.')[0] + 'Z'; // Use UTC

      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${formatGCal(start)}/${formatGCal(end)}`;
      window.open(url, '_blank');
  }

  const downloadIcs = () => {
      const dates = getEventDates();
      if (!dates) return;
      const { start, end } = dates;

      const formatICS = (d: Date) => d.toISOString().replace(/[-:.]/g, '').split('.')[0] + 'Z'; // Use UTC

      const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${eventData.title || 'Event'}`,
          `DESCRIPTION:${eventData.description || ''}`,
          `DTSTART:${formatICS(start)}`,
          `DTEND:${formatICS(end)}`,
          'END:VEVENT',
          'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(eventData.title || 'event').replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  // Availability State
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())


  const handleSlotToggle = (slotId: string, forceState?: 'add' | 'remove') => {
    setSelectedSlots(prev => {
      const next = new Set(prev)
      const exists = next.has(slotId)
      const action = forceState || (exists ? 'remove' : 'add')

      if (action === 'add') {
        next.add(slotId)
      } else {
        next.delete(slotId)
      }
      return next
    })
  }

  // Parse Config
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')

  // Fetch Event Data
  const [eventData, setEventData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hydration State
  const [hasLoaded, setHasLoaded] = useState(false)

  const isMe = useCallback((p: any) => {
      if (user?.id && p.user_id) return p.user_id === user.id
      if (!p.user_id) return p.name === name
      return false
  }, [user?.id, name])

  // Deduped participants list
  const participants = useMemo(() => {
    return (eventData?.participants || []).reduce((acc: any[], p: any) => {
        // Check if we already have this participant
        const existingIdx = acc.findIndex(item => (item.user_id && item.user_id === p.user_id) || (!item.user_id && !p.user_id && item.name === p.name))

        if (existingIdx === -1) {
            acc.push(p)
        } else {
            const current = acc[existingIdx]
            const pTime = p.updated_at ? new Date(p.updated_at).getTime() : 0
            const cTime = current.updated_at ? new Date(current.updated_at).getTime() : 0
            // Keep the one with availability or more recent
            if (pTime > cTime || (!current.availability && p.availability)) {
                acc[existingIdx] = p
            }
        }
        return acc
    }, [])
  }, [eventData?.participants])

  // Hydrate existing availability on load
  // Hydrate existing availability on load
  useEffect(() => {
    if (hasLoaded || participants.length === 0 || !name) return

    const myRecord = participants.find(isMe)
    // Only hydrate if we found a record. If not, it means we are new, so we start empty (default).
    // But we MUST set hasLoaded to true to stop future overwrites.

    if (myRecord) {
        if (Array.isArray(myRecord.availability)) {
            setSelectedSlots(new Set(myRecord.availability))
        }
    }
    setHasLoaded(true)
  }, [participants, name, hasLoaded, isMe])

  // Columns State
  const [columns, setColumns] = useState<{ label: string; subLabel?: string }[]>([])

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_URL}/events/${id}`)
        if (!res.ok) throw new Error('Event not found')
        const data = await res.json()
        setEventData(data)

        // Hydrate Columns based on configuration
        const { event_type, configuration } = data
        let newColumns = []

        if (event_type === 'days_of_week') {
             // Config: { days: ['Mon', 'Tue'] }
             if (configuration && configuration.days) {
                 newColumns = configuration.days.map((d: string) => ({ label: d }))
             } else {
                  newColumns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => ({ label: d }))
             }
        } else {
             // Config: { dates: ['2025-02-10', '2025-02-11'] }
             if (configuration && configuration.dates && configuration.dates.length > 0) {
                newColumns = configuration.dates.map((d: string) => {
                     const date = parseISO(d)
                     return {
                        label: format(date, 'EEE'),
                        subLabel: format(date, 'MMM d')
                     }
                })
             } else {
                 newColumns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => ({ label: d }))
             }
        }
        setColumns(newColumns)

      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchEvent()
  }, [id, API_URL])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setIsSignedIn(true)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // State for interactive highlighting
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Group Availability Calculation
  // Map slotId -> Array of participant names
  const [slotToNames, setSlotToNames] = useState<Map<string, string[]>>(new Map())
  const [totalParticipants, setTotalParticipants] = useState(0)

  // Re-calculate group heatmap whenever eventData OR local state changes
  useEffect(() => {
    const mapping = new Map<string, string[]>()
    const amIParticipant = participants.some(isMe)

    // 1. Process all participants except myself
    participants.forEach((p: any) => {
        if (isMe(p)) return // Skip server data for myself

        if (Array.isArray(p.availability)) {
            p.availability.forEach((slot: string) => {
                const current = mapping.get(slot) || []
                current.push(p.name)
                mapping.set(slot, current)
            })
        }
    })

    // 2. Inject local state for myself instantly
    if (name) {
        selectedSlots.forEach((slot: string) => {
            const current = mapping.get(slot) || []
            current.push(name)
            mapping.set(slot, current)
        })
    }

    setSlotToNames(mapping)
    // Total is participants count + 1 if I'm new, or just count if I'm already in list
    setTotalParticipants(amIParticipant ? participants.length : (name ? participants.length + 1 : participants.length))
  }, [participants, selectedSlots, name])

  // Get slots for the currently hovered participant in the list
  const hoveredParticipantSlots = useMemo(() => {
    if (!hoveredParticipantId) return null
    const p = participants.find((p: any) => (p.id || p.name) === hoveredParticipantId)
    if (!p || !Array.isArray(p.availability)) return null
    return new Set(p.availability as string[])
  }, [hoveredParticipantId, participants])

  // Get slots for "Me" (either from local state or server data if not editing)
  // Actually, for "Me" highlight, we can just use selectedSlots

  // Polling for Real-time updates (every 3s)
  useEffect(() => {
      if (!id) return
      const interval = setInterval(() => {
          fetch(`${API_URL}/events/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setEventData((prev: any) => ({ ...prev, participants: data.participants }))
                }
            })
            .catch(err => console.error('Poll error:', err))
      }, 3000)
      return () => clearInterval(interval)
  }, [id, API_URL])

  // Auto-Save Availability
  useEffect(() => {
    if (!isSignedIn || !name) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/events/${id}/participate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                availability: Array.from(selectedSlots),
                user_id: user?.id
            })
        })
        if (!res.ok) throw new Error('Failed to save')
        // console.log('Saved successfully')
      } catch (err) {
        console.error('Save error:', err)
      }
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
  }, [selectedSlots, isSignedIn, name, id, API_URL, user?.id])

  // Derived state for highlighting
  const highlightedNames = hoveredSlot ? (slotToNames.get(hoveredSlot) || []) : []

  // Auto-fill name if logged in
  useEffect(() => {
    if (user?.user_metadata?.name && !name) {
        setName(user.user_metadata.name)
        setIsSignedIn(true)
    }
  }, [user])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (error) return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">

          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-8">
                  <Link to="/" className="flex justify-center mb-8 opacity-90 hover:opacity-100 transition-opacity">
                      <img src="/alyne-logo.svg" alt="Alyne" className="h-9" />
                  </Link>
              </div>

            <Card className="shadow-lg max-w-md w-full">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold tracking-tight">{eventData?.title || 'Join Event'}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {eventData?.description || 'Join the event to share your availability.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Primary Guest Entry */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Display Name</Label>
                        <Input
                            id="name"
                            placeholder="How should we call you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            className="h-10"
                        />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-10 font-medium" disabled={!name.trim()}>
                        Enter Event
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                        <span className="bg-card px-3 text-muted-foreground/60">or join with account</span>
                    </div>
                </div>

                {/* Unified Social/Account Login */}
                {!user && (
                    <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="block">
                        <Button variant="outline" className="w-full h-12 font-bold border-white/20 hover:bg-white/5 transition-all rounded-xl shadow-sm">
                            Sign In with Account
                        </Button>
                    </Link>
                )}
            </CardContent>
            </Card>
            <div className="mt-8 text-center">
                <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      <Sidebar showNav={!!user}>
        <div className="mb-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2 bg-primary/10 px-3 py-1 rounded-full w-fit">
                {eventData?.event_type === 'days_of_week' ? 'Weekly' : 'Specific Dates'}
            </div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{eventData?.title || 'Loading...'}</h1>
            <p className="text-sm text-muted-foreground">{eventData?.description || 'No description provided.'}</p>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Participants</h4>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{totalParticipants}</span>
            </div>
            <div className="space-y-1">
                {participants.map((p: any) => {
                    const isHighlighted = highlightedNames.includes(p.name)
                    const me = isMe(p)
                    const pid = p.id || p.name
                    return (
                        <div
                            key={pid}
                            onMouseEnter={() => setHoveredParticipantId(pid)}
                            onMouseLeave={() => setHoveredParticipantId(null)}
                            className={`flex items-center gap-3 text-sm p-2 rounded-lg transition-all cursor-pointer ${
                                isHighlighted || (hoveredParticipantId === pid) ? 'bg-primary/10 text-primary font-medium translate-x-1' : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                        >
                            <Avatar className={`h-8 w-8 border-2 ${isHighlighted || (hoveredParticipantId === pid) ? 'border-primary' : 'border-background'}`}>
                                <AvatarFallback className="text-xs font-bold">{p.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col leading-none">
                                <span className="truncate">{p.name} {me ? '(You)' : ''}</span>
                                {me && <span className="text-[10px] opacity-70 font-normal">Online</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </Sidebar>

      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-20 md:pt-10 max-w-[1600px] mx-auto min-w-0">
        <div className="space-y-8 animate-in fade-in duration-500 delay-150">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
                <div>
                     <div className="flex items-center gap-2 text-primary font-medium mb-1">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-semibold">Ready to vote</span>
                     </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Cast your vote</h2>
                    <p className="text-muted-foreground mt-1">Paint over the times you are available. Changes are saved automatically.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="gap-2 rounded-full hover:bg-muted shadow-sm">
                                <Calendar className="h-4 w-4" />
                                <span className="hidden sm:inline">Add to Calendar</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={addToGoogleCalendar}>
                                Google Calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={downloadIcs}>
                                Download .ics File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="lg" onClick={copyLink} className="gap-2 rounded-full hover:bg-muted shadow-sm">
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {isCopied ? 'Link Copied!' : 'Share Event Link'}
                    </Button>

                    {user?.id === eventData?.created_by && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEditClick}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Event
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Split View */}
            <div className="grid xl:grid-cols-2 gap-8 relative z-10">
                {/* My Availability */}
                <Card className="shadow-sm border bg-card flex flex-col overflow-hidden h-fit">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">My Availability</CardTitle>
                                    <CardDescription className="text-xs">Click and drag to paint</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium bg-green-500/10 text-green-700 px-2.5 py-1 rounded-md">
                                Available
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-card">
                        <InteractiveGrid
                          columns={columns}
                          selectedSlots={selectedSlots}
                          onSlotToggle={handleSlotToggle}
                          startTime={eventData?.configuration?.startTime || '09:00'}
                          endTime={eventData?.configuration?.endTime || '17:00'}
                        />
                    </CardContent>
                </Card>

                {/* Group Availability */}
                <Card className="shadow-sm border bg-card flex flex-col overflow-hidden h-fit">
                     <CardHeader className="pb-4 border-b">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Group Heatmap</CardTitle>
                                    <CardDescription className="text-xs">Hover to see who is available</CardDescription>
                                </div>
                            </div>
                             <div className="flex items-center gap-2 text-xs font-medium bg-muted px-2.5 py-1 rounded-md">
                                {totalParticipants} Participants
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-card">
                          <HeatmapGrid
                          columns={columns}
                          slotToNames={slotToNames}
                          totalParticipants={totalParticipants}
                          onHover={(slotId) => setHoveredSlot(slotId)}
                          hoveredParticipantSlots={hoveredParticipantSlots}
                          startTime={eventData?.configuration?.startTime || '09:00'}
                          endTime={eventData?.configuration?.endTime || '17:00'}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Attendees List (Mobile / Bottom) */}
            <Card className="md:hidden border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Attendees ({totalParticipants})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {participants.map((p: any) => {
                             const isHighlighted = highlightedNames.includes(p.name)
                             const me = isMe(p)
                             const pid = p.id || p.name
                             return (
                             <div
                                key={pid}
                                onMouseEnter={() => setHoveredParticipantId(pid)}
                                onMouseLeave={() => setHoveredParticipantId(null)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isHighlighted || hoveredParticipantId === pid ? 'bg-primary/5 border-primary/20 scale-[1.02]' : 'border-transparent bg-muted/30'}`}
                             >
                                 <Avatar className="h-8 w-8">
                                     <AvatarFallback>{p.name?.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <span className={`text-sm font-medium ${isHighlighted || hoveredParticipantId === pid ? 'text-primary' : ''}`}>
                                     {p.name} {me ? '(You)' : ''}
                                 </span>
                             </div>
                            )
                         })}
                    </div>
                </CardContent>
            </Card>

        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Details</DialogTitle>
            <DialogDescription>Update the title and description of your event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the event "{eventData?.title}" and all participant data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface InteractiveGridProps {
  columns: { label: string; subLabel?: string }[]
  selectedSlots: Set<string>
  onSlotToggle: (slotId: string, forceState?: 'add' | 'remove') => void
  startTime: string
  endTime: string
}

function InteractiveGrid({ columns, selectedSlots, onSlotToggle, startTime, endTime }: InteractiveGridProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')

    // Parse start/end times
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)

    // We need startTotalMinutes for the loop later
    const startTotalMinutes = startH * 60 + startM
    const endTotalMinutes = endH * 60 + endM
    const durationMinutes = endTotalMinutes - startTotalMinutes

    // Calculate 30-min slots
    const rowCount = Math.max(1, Math.ceil(durationMinutes / 30))

    const rows = Array.from({ length: rowCount })

    const handleMouseDown = (slotId: string) => {
        setIsDragging(true)
        const exists = selectedSlots.has(slotId)
        setDragMode(exists ? 'remove' : 'add')
        onSlotToggle(slotId, exists ? 'remove' : 'add')
    }

    const handleMouseEnter = (slotId: string) => {
        if (isDragging) {
            onSlotToggle(slotId, dragMode)
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp)
        return () => window.removeEventListener('mouseup', handleMouseUp)
    }, [])

    return (
        <div className="w-full overflow-hidden relative group">
             {/* Scroll Indicators */}
             <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
             <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />

             <div className="overflow-x-auto pb-4 -mb-4 scrollbar-hide">
                 <div className="min-w-[400px] p-4 select-none">
                     <div
                        className="grid gap-px bg-border border border-border"
                        style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}
                     >
                        {/* Header */}
                        <div className="bg-background sticky left-0 z-20"></div>
                        {columns.map((col, i) => (
                            <div key={`${col.label}-${i}`} className="bg-background p-2 text-center text-sm font-medium">
                                {col.label}
                                {col.subLabel && <div className="text-xs text-muted-foreground">{col.subLabel}</div>}
                            </div>
                        ))}

                        {/* Rows */}
                        {rows.map((_, i) => {
                            // Time Logic
                            const currentSlotStartMinutes = startTotalMinutes + (i * 30)
                            const hour = Math.floor(currentSlotStartMinutes / 60)
                            const minutes = currentSlotStartMinutes % 60
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            const displayHour = hour > 12 ? hour - 12 : hour

                            // Simplified Label
                            // Hour: "10 AM" (bold)
                            // Half: ":30" (small)
                            const timeLabel = minutes === 0
                                ? <span className="font-bold text-foreground/80">{displayHour} <span className="text-[10px] font-normal text-muted-foreground">{ampm}</span></span>
                                : <span className="text-[10px] text-muted-foreground/60">:30</span>

                            return (
                                <div key={i} className="contents">
                                    <div className={`bg-background px-2 py-1 text-xs text-right -mt-2.5 sticky left-0 z-10 flex items-center justify-end ${minutes === 0 ? '' : ''}`}>
                                        {timeLabel}
                                    </div>
                                    {columns.map((_, j) => {
                                        const slotId = `${i}-${j}`
                                        const isSelected = selectedSlots.has(slotId)
                                        return (
                                            <div
                                                key={slotId}
                                                onMouseDown={() => handleMouseDown(slotId)}
                                                onMouseEnter={() => handleMouseEnter(slotId)}
                                                className={`bg-background h-8 cursor-pointer transition-colors relative group border-t border-dashed border-border/50 ${
                                                    isSelected ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-green-100'
                                                } ${minutes === 30 ? 'border-border/30' : ''}`}
                                            >
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                     </div>
                 </div>
             </div>
             <div className="md:hidden text-center text-xs text-muted-foreground mt-2 animate-pulse">
                Swipe to see more times &rarr;
             </div>
        </div>
    )
}

function HeatmapGrid({
    columns,
    slotToNames,
    totalParticipants,
    onHover,
    hoveredParticipantSlots,
    startTime,
    endTime
}: {
    columns: { label: string; subLabel?: string }[],
    slotToNames: Map<string, string[]>,
    totalParticipants: number,
    onHover: (slotId: string | null) => void,
    hoveredParticipantSlots: Set<string> | null,
    startTime: string,
    endTime: string
}) {
    // Local state to track hover instantly
    const [localHoveredSlot, setLocalHoveredSlot] = useState<string | null>(null)

    // Parse start/end times
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)

    const startTotalMinutes = startH * 60 + startM
    const endTotalMinutes = endH * 60 + endM
    const durationMinutes = endTotalMinutes - startTotalMinutes

    // Calculate 30-min slots
    const rowCount = Math.max(1, Math.ceil(durationMinutes / 30))

     const rows = Array.from({ length: rowCount })

     return (
        <div className="w-full overflow-hidden relative group" onMouseLeave={() => onHover(null)}>
             {/* Scroll Indicators */}
             <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
             <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />

             <div className="overflow-x-auto pb-4 -mb-4 scrollbar-hide">
                 <div className="min-w-[400px] p-4">
                     <div
                        className="grid gap-px bg-border border border-border"
                        style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}
                     >
                        {/* Header */}
                        <div className="bg-background sticky left-0 z-20"></div>
                        {columns.map((col, i) => (
                            <div key={`${col.label}-${i}`} className="bg-background p-2 text-center text-sm font-medium">
                                {col.label}
                                {col.subLabel && <div className="text-xs text-muted-foreground">{col.subLabel}</div>}
                            </div>
                        ))}

                        {/* Rows */}
                        {rows.map((_, i) => {
                            const currentSlotStartMinutes = startTotalMinutes + (i * 30)
                            const hour = Math.floor(currentSlotStartMinutes / 60)
                            const minutes = currentSlotStartMinutes % 60
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            const displayHour = hour > 12 ? hour - 12 : hour

                            // Simplified Label
                            const timeLabel = minutes === 0
                                ? <span className="font-bold text-foreground/80">{displayHour} <span className="text-[10px] font-normal text-muted-foreground">{ampm}</span></span>
                                : <span className="text-[10px] text-muted-foreground/60">:30</span>

                            return (
                                <div key={i} className="contents">
                                    <div className={`bg-background px-2 py-1 text-xs text-right -mt-2.5 sticky left-0 z-10 flex items-center justify-end ${minutes === 0 ? '' : ''}`}>
                                        {timeLabel}
                                    </div>
                                    {columns.map((_, j) => {
                                        const slotId = `${i}-${j}`
                                        const names = slotToNames.get(slotId) || []
                                        const count = names.length
                                        // Opacity = count / max(1, total)
                                        const opacity = totalParticipants > 0 ? (count / totalParticipants) : 0
                                        const isHoveredParticipantSlot = hoveredParticipantSlots?.has(slotId)

                                        return (
                                        <div
                                            key={`${i}-${j}`}
                                            className={cn(
                                                "bg-background h-8 relative group transition-all duration-200",
                                                isHoveredParticipantSlot ? "z-20 ring-2 ring-primary ring-inset shadow-[0_0_15px_rgba(var(--primary),0.3)]" : ""
                                            )}
                                            onMouseEnter={() => {
                                                setLocalHoveredSlot(slotId)
                                                onHover(slotId)
                                            }}
                                            onMouseLeave={() => {
                                                setLocalHoveredSlot(null)
                                                // We don't clear parent immediately to avoid flickering highlight, or do we?
                                                // Actually, let's keep parent sync but manage tooltip locally for speed.
                                            }}
                                        >
                                            {count > 0 && (
                                                <div
                                                    className={cn(
                                                        "absolute inset-0 bg-green-500 transition-all duration-500",
                                                        isHoveredParticipantSlot ? "opacity-90" : ""
                                                    )}
                                                    style={!isHoveredParticipantSlot ? { opacity: Math.max(0.1, opacity) } : {}} // Override opacity if hovered
                                                />
                                            )}
                                            {/* Tooltip on hover */}
                                            {count > 0 && localHoveredSlot === slotId && (
                                                <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                                    <div className="font-bold border-b border-gray-700 pb-1 mb-1">{count}/{totalParticipants} Available</div>
                                                    {names.map(n => <div key={n}>{n}</div>)}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            )
                        })}
                     </div>
                 </div>
             </div>
             <div className="md:hidden text-center text-xs text-muted-foreground mt-2 animate-pulse">
                Swipe to see more times &rarr;
             </div>
        </div>
    )
}
