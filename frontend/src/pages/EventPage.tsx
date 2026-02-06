import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Loader2, Copy, Check, Users } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sidebar } from '@/components/Sidebar'

export function EventPage() {
  const { id } = useParams()

  const [name, setName] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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

  // Hydrate existing availability on load
  useEffect(() => {
    if (hasLoaded || !eventData?.participants || !name) return

    const myRecord = eventData.participants.find((p: any) => p.name === name)
    if (myRecord) {
        if (Array.isArray(myRecord.availability)) {
            setSelectedSlots(new Set(myRecord.availability))
        }
        setHasLoaded(true)
    }
  }, [eventData, name, hasLoaded])

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

  // Re-calculate group heatmap whenever eventData changes
  useEffect(() => {
    if (!eventData?.participants) return

    const mapping = new Map<string, string[]>()
    let total = 0

    eventData.participants.forEach((p: any) => {
        total++
        if (Array.isArray(p.availability)) {
            p.availability.forEach((slot: string) => {
                const current = mapping.get(slot) || []
                current.push(p.name)
                mapping.set(slot, current)
            })
        }
    })

    setSlotToNames(mapping)
    setTotalParticipants(total)
  }, [eventData])

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
                availability: Array.from(selectedSlots)
            })
        })
        if (!res.ok) throw new Error('Failed to save')
        // console.log('Saved successfully')
      } catch (err) {
        console.error('Save error:', err)
      }
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
  }, [selectedSlots, isSignedIn, name, id, API_URL])

  // Derived state for highlighting
  const highlightedNames = hoveredSlot ? (slotToNames.get(hoveredSlot) || []) : []

  const { user } = useAuth()

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
          {/* Background Decorative */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 ring-1 ring-black/5">
                      <img src="/alyne-logo.svg" alt="Alyne" className="h-8" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">{eventData?.title || 'Event Sign In'}</h1>
                  <p className="text-muted-foreground">Join the event to share your availability.</p>
              </div>

            <Card className="shadow-xl bg-card/80 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
            <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl">Authentication</CardTitle>
                <CardDescription>
                  Enter your name to continue as a guest or login.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid gap-6">
                    {!user && (
                         <div className="grid grid-cols-2 gap-3">
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Log In</Button>
                            </Link>
                            <Link to="/#signup">
                                <Button variant="secondary" className="w-full">Sign Up</Button>
                            </Link>
                         </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue as guest</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                            id="name"
                            placeholder="How should we call you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            className="h-11"
                            />
                        </div>
                        <Button type="submit" size="lg" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={!name.trim()}>
                            Enter Event
                        </Button>
                    </form>
                </div>
            </CardContent>
            </Card>
            <div className="mt-8 text-center">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    &larr; Back to Home
                </Link>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col md:flex-row">
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
                {eventData?.participants?.map((p: any) => {
                    const isHighlighted = highlightedNames.includes(p.name)
                    return (
                        <div
                            key={p.id || p.name}
                            className={`flex items-center gap-3 text-sm p-2 rounded-lg transition-all ${
                                isHighlighted ? 'bg-primary/10 text-primary font-medium translate-x-1' : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                        >
                            <Avatar className={`h-8 w-8 border-2 ${isHighlighted ? 'border-primary' : 'border-background'}`}>
                                <AvatarFallback className="text-xs font-bold">{p.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col leading-none">
                                <span className="truncate">{p.name} {p.name === name ? '(You)' : ''}</span>
                                {p.name === name && <span className="text-[10px] opacity-70 font-normal">Online</span>}
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
                        <span>Ready to vote</span>
                     </div>
                    <h2 className="text-3xl font-bold tracking-tight">Cast your vote</h2>
                    <p className="text-muted-foreground mt-1">Paint over the times you are available. Changes are saved automatically.</p>
                </div>
                <Button variant="outline" size="lg" onClick={copyLink} className="gap-2 rounded-full hover:bg-muted shadow-sm">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {isCopied ? 'Link Copied!' : 'Share Event Link'}
                </Button>
            </div>

            {/* Split View */}
            <div className="grid xl:grid-cols-2 gap-8">
                {/* My Availability */}
                <Card className="shadow-sm border bg-card/50 flex flex-col h-[700px]">
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
                    <CardContent className="p-0 overflow-auto flex-1 relative bg-card">
                        <InteractiveGrid
                          columns={columns}
                          selectedSlots={selectedSlots}
                          onSlotToggle={handleSlotToggle}
                        />
                    </CardContent>
                </Card>

                {/* Group Availability */}
                <Card className="shadow-sm border bg-card/50 flex flex-col h-[700px]">
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
                    <CardContent className="p-0 overflow-auto flex-1 relative bg-card">
                         <HeatmapGrid
                          columns={columns}
                          slotToNames={slotToNames}
                          totalParticipants={totalParticipants}
                          onHover={(slotId) => setHoveredSlot(slotId)}
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
                        {eventData?.participants?.map((p: any) => {
                             const isHighlighted = highlightedNames.includes(p.name)
                             return (
                             <div key={p.id || p.name} className={`flex items-center gap-3 p-3 rounded-lg border ${isHighlighted ? 'bg-primary/5 border-primary/20' : 'border-transparent bg-muted/30'}`}>
                                 <Avatar className="h-8 w-8">
                                     <AvatarFallback>{p.name?.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <span className={`text-sm font-medium ${isHighlighted ? 'text-primary' : ''}`}>
                                     {p.name} {p.name === name ? '(You)' : ''}
                                 </span>
                             </div>
                            )
                         })}
                    </div>
                </CardContent>
            </Card>

        </div>
      </main>
    </div>
  )
}

interface InteractiveGridProps {
  columns: { label: string; subLabel?: string }[]
  selectedSlots: Set<string>
  onSlotToggle: (slotId: string, forceState?: 'add' | 'remove') => void
}

function InteractiveGrid({ columns, selectedSlots, onSlotToggle }: InteractiveGridProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')

    // Rows (9 AM to 5 PM = 9 hours)
    const rows = Array.from({ length: 9 })

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
        <div className="min-w-[400px] p-4 select-none">
             <div
                className="grid gap-px bg-border border border-border"
                style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}
             >
                {/* Header */}
                <div className="bg-background"></div>
                {columns.map((col, i) => (
                    <div key={`${col.label}-${i}`} className="bg-background p-2 text-center text-sm font-medium">
                        {col.label}
                        {col.subLabel && <div className="text-xs text-muted-foreground">{col.subLabel}</div>}
                    </div>
                ))}

                {/* Rows */}
                {rows.map((_, i) => {
                    const hour = 9 + i
                    const time = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`
                    return (
                        <div key={i} className="contents">
                            <div className="bg-background p-2 text-xs text-right text-muted-foreground -mt-2.5">
                                {time}
                            </div>
                            {columns.map((_, j) => {
                                const slotId = `${i}-${j}`
                                const isSelected = selectedSlots.has(slotId)
                                return (
                                    <div
                                        key={slotId}
                                        onMouseDown={() => handleMouseDown(slotId)}
                                        onMouseEnter={() => handleMouseEnter(slotId)}
                                        className={`bg-background h-10 cursor-pointer transition-colors relative group border-t border-dashed border-gray-100 ${
                                            isSelected ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-green-100'
                                        }`}
                                    >
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
             </div>
        </div>
    )
}

function HeatmapGrid({
    columns,
    slotToNames,
    totalParticipants,
    onHover
}: {
    columns: { label: string; subLabel?: string }[],
    slotToNames: Map<string, string[]>,
    totalParticipants: number,
    onHover: (slotId: string | null) => void
}) {
     const rows = Array.from({ length: 9 })

     return (
        <div className="min-w-[400px] p-4" onMouseLeave={() => onHover(null)}>
             <div
                className="grid gap-px bg-border border border-border"
                style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}
             >
                {/* Header */}
                <div className="bg-background"></div>
                {columns.map((col, i) => (
                    <div key={`${col.label}-${i}`} className="bg-background p-2 text-center text-sm font-medium">
                        {col.label}
                        {col.subLabel && <div className="text-xs text-muted-foreground">{col.subLabel}</div>}
                    </div>
                ))}

                {/* Rows */}
                {rows.map((_, i) => {
                    const hour = 9 + i
                    const time = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`
                    return (
                        <div key={i} className="contents">
                            <div className="bg-background p-2 text-xs text-right text-muted-foreground -mt-2.5">
                                {time}
                            </div>
                            {columns.map((_, j) => {
                                const slotId = `${i}-${j}`
                                const names = slotToNames.get(slotId) || []
                                const count = names.length
                                // Opacity = count / max(1, total)
                                const opacity = totalParticipants > 0 ? (count / totalParticipants) : 0

                                return (
                                <div
                                    key={`${i}-${j}`}
                                    className="bg-background h-10 relative group"
                                    onMouseEnter={() => onHover(slotId)}
                                >
                                    {count > 0 && (
                                        <div
                                            className="absolute inset-0 bg-green-500 transition-all duration-500"
                                            style={{ opacity: Math.max(0.1, opacity) }} // Min 0.1 so even single votes are visible
                                        />
                                    )}
                                    {/* Tooltip on hover */}
                                    {count > 0 && (
                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap z-50 pointer-events-none shadow-lg">
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
    )
}
