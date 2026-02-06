import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Copy, Check, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { addDays, differenceInDays, format, parseISO } from 'date-fns'

export function EventPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
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
      <div className="min-h-screen bg-muted/30 flex flex-col">
          {/* Top Nav for Login/Back */}
          <header className="px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <img src="/alyne-logo.svg" alt="Alyne" className="h-8" />
                    <span>Alyne</span>
                </Link>
             </div>
             <div>
                {user ? (
                    <Link to="/dashboard">
                        <Button variant="ghost">Go to Dashboard</Button>
                    </Link>
                ) : (
                    <div className="flex gap-4">
                         <Link to="/login">
                            <Button variant="ghost">Log in</Button>
                         </Link>
                         <Link to="/#signup">
                            <Button>Sign up free</Button>
                         </Link>
                    </div>
                )}
             </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-6 -mt-16">
            <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Sign in to Event</CardTitle>
                <CardDescription>
                Enter your name to show your availability.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                    id="name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    />
                </div>
                <Button type="submit" className="w-full" disabled={!name.trim()}>
                    Continue
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                    Event ID: <span className="font-mono">{id}</span>
                </p>
                </form>
            </CardContent>
            </Card>
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col hidden md:flex">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>
        {user && (
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 px-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
        )}
         <div className="flex-1">
            <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-primary mb-1">Event Details</h3>
                <p className="text-sm font-medium">{eventData?.title || 'Loading...'}</p>
                 <p className="text-xs text-muted-foreground mt-1">
                    {eventData?.event_type === 'days_of_week' ? 'Weekly Recurring' : 'Specific Dates'}
                </p>
            </div>
             <div className="px-2">
                 <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Participants ({totalParticipants})</h4>
                 <div className="space-y-2">
                     {eventData?.participants?.map((p: any) => {
                         const isHighlighted = highlightedNames.includes(p.name)
                         return (
                             <div
                                key={p.id || p.name}
                                className={`flex items-center gap-2 text-sm p-1.5 rounded-md transition-colors ${
                                    isHighlighted ? 'bg-primary/20 font-medium text-primary' : 'text-muted-foreground'
                                }`}
                             >
                                 <Avatar className={`h-6 w-6 ${isHighlighted ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                                     <AvatarFallback className="text-[10px]">{p.name?.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <span className="truncate">{p.name} {p.name === name ? '(You)' : ''}</span>
                             </div>
                         )
                     })}
                 </div>
             </div>
         </div>
         {/* Current User Footer */}
         <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium truncate">{name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSignedIn(false)} title="Change Name">
                    <span className="sr-only">Log out</span>
                     <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                </Button>
            </div>
         </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center">
             <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium truncate max-w-[150px]">{searchParams.get('name') || 'Event'}</span>
          </div>
      </header>

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{eventData?.title}</h1>
                    <p className="text-muted-foreground">Please paint your availability below. Changes save automatically.</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {isCopied ? 'Copied Link' : 'Copy Link'}
                </Button>
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* My Availability */}
                <Card className="shadow-md border-primary/20">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">My Availability</CardTitle>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                                <span className="text-muted-foreground">Available</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto max-h-[600px]">
                        <InteractiveGrid
                          columns={columns}
                          selectedSlots={selectedSlots}
                          onSlotToggle={handleSlotToggle}
                        />
                    </CardContent>
                </Card>

                {/* Group Availability */}
                <Card className="shadow-md">
                     <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Group's Availability</CardTitle>
                             <div className="flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 bg-green-500/80 rounded-sm"></span>
                                <span className="text-muted-foreground">{totalParticipants > 0 ? `${totalParticipants} Participants` : 'No data yet'}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto max-h-[600px]">
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
            <Card className="md:hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Attendees ({totalParticipants})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {eventData?.participants?.map((p: any) => {
                             const isHighlighted = highlightedNames.includes(p.name)
                             return (
                             <div key={p.id || p.name} className={`flex items-center gap-3 p-2 rounded ${isHighlighted ? 'bg-primary/20' : ''}`}>
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
                        <>
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
                        </>
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
                        <>
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
                        </>
                    )
                })}
             </div>
        </div>
    )
}
