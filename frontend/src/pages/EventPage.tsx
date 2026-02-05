import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { addDays, differenceInDays, format, parseISO } from 'date-fns'

export function EventPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Parse Config
  const type = searchParams.get('type') || 'date'
  const daysParam = searchParams.get('days')
  const fromParam = searchParams.get('from')

  // Determine Columns
  let columns: { label: string; subLabel?: string }[] = []

  if (type === 'days' && daysParam) {
    columns = daysParam.split(',').map(d => ({ label: d }))
  } else if (fromParam) {
     // Generate dates from 'from' param
     // Default to 5 days if valid from date
     try {
       const startDate = parseISO(fromParam)
       const toParam = searchParams.get('to')
       let daysCount = 5

       if (toParam) {
           const endDate = parseISO(toParam)
           const diff = differenceInDays(endDate, startDate)
           daysCount = diff >= 0 ? diff + 1 : 1
       }

       columns = Array.from({ length: daysCount }).map((_, i) => {
         const date = addDays(startDate, i)
         return {
           label: format(date, 'EEE'),
           subLabel: format(date, 'MMM d')
         }
       })
     } catch (e) {
       // Fallback
       columns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => ({
           label: d,
           subLabel: `Feb ${10 + i}`
       }))
     }
  } else {
      // Default Fallback
       columns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => ({
           label: d,
           subLabel: `Feb ${10 + i}`
       }))
  }

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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
       <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col hidden md:flex">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>
         <div className="flex-1">
            <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-primary mb-1">Event Details</h3>
                <p className="text-sm font-medium">{searchParams.get('name') || 'Weekly Standup'}</p>
                 <p className="text-xs text-muted-foreground mt-1">
                    {type === 'days' ? 'Weekly Recurring' : 'Specific Dates'}
                </p>
            </div>
         </div>
      </aside>

      <main className="md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{searchParams.get('name') || 'Weekly Standup'}</h1>
                    <p className="text-muted-foreground">Please paint your availability below.</p>
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
                        <InteractiveGrid columns={columns} />
                    </CardContent>
                </Card>

                {/* Group Availability */}
                <Card className="shadow-md">
                     <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Group's Availability</CardTitle>
                             <div className="flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 bg-green-500/80 rounded-sm"></span>
                                <span className="text-muted-foreground">3/5 Available</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto max-h-[600px]">
                         <HeatmapGrid columns={columns} />
                    </CardContent>
                </Card>
            </div>

            {/* Attendees List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Attendees (1)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{name} (You)</span>
                    </div>
                </CardContent>
            </Card>

        </div>
      </main>
    </div>
  )
}

function InteractiveGrid({ columns }: { columns: { label: string; subLabel?: string }[] }) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
    const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')

    // Rows (9 AM to 5 PM = 9 hours)
    // Actually typically 8 hours (9-17) but logic was 9 rows. Keeping 9 rows (9am to 6pm end?)
    // Logic: 9 rows. 9 + i.
    const rows = Array.from({ length: 9 })

    const toggleSlot = (slotId: string, forceState?: 'add' | 'remove') => {
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

    const handleMouseDown = (slotId: string) => {
        setIsDragging(true)
        const exists = selectedSlots.has(slotId)
        setDragMode(exists ? 'remove' : 'add')
        toggleSlot(slotId, exists ? 'remove' : 'add')
    }

    const handleMouseEnter = (slotId: string) => {
        if (isDragging) {
            toggleSlot(slotId, dragMode)
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

function HeatmapGrid({ columns }: { columns: { label: string; subLabel?: string }[] }) {
     const rows = Array.from({ length: 9 })

     return (
        <div className="min-w-[400px] p-4">
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
                                // Mock random opacity for heatmap
                                const opacity = Math.random() > 0.5 ? Math.random() : 0
                                return (
                                <div
                                    key={`${i}-${j}`}
                                    className="bg-background h-10 relative"
                                >
                                    {opacity > 0 && (
                                        <div
                                            className="absolute inset-0 bg-green-500"
                                            style={{ opacity }}
                                        />
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
