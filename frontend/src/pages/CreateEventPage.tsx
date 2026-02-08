import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { addDays, format, addMonths, subMonths } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Sidebar } from '@/components/Sidebar'

export function CreateEventPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [eventName, setEventName] = useState('')
  const [mode, setMode] = useState<'date' | 'days'>('date')

  // Determine Back Link
  // 1. If explicit 'from' state exists, use it
  // 2. If path is '/events/new', go to Dashboard (or specific team if known, but Dashboard is safer)
  // 3. Default to Home
  const { user } = useAuth()

  // Determine Back Link
  // 1. If explicit 'from' state exists, use it
  // 2. If user is logged in, go to Dashboard
  // 3. Default to Home
  const backLink = location.state?.from || (user ? '/dashboard' : '/')
  const backLabel = location.state?.label || (user ? 'Back to Dashboard' : 'Back to Home')

  // Date Mode State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  })
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Days Mode State
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Time State
  const [earliestTime, setEarliestTime] = useState('09:00')
  const [latestTime, setLatestTime] = useState('17:00')

  // Determine API URL based on environment
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')


  const isAuthenticated = !!user

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!eventName.trim()) {
      alert('Please enter a title')
      return
    }

    // Construct configuration
    const configuration: any = {
        startTime: earliestTime,
        endTime: latestTime
    }

    if (mode === 'date') {
       // We need to generate the array of date strings from the range
       const dates = []
       if (dateRange?.from) {
          let curr = dateRange.from
          const end = dateRange.to || dateRange.from
          while (curr <= end) {
              dates.push(curr.toISOString())
              curr = addDays(curr, 1)
          }
       }
       configuration.dates = dates
    } else {
        configuration.days = Array.from(selectedDays)
    }

    const payload = {
      title: eventName,
      description: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      event_type: mode === 'date' ? 'specific_dates' : 'days_of_week',
      configuration,
      user_id: user?.id, // Link to authenticated user
      team_id: searchParams.get('teamId') // Link to team if applicable
    }

    try {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Failed to create event')
        }

        const data = await res.json()
        navigate(`/event/${data.id}`)

    } catch (error: any) {
        console.error('Create error:', error)
        alert('Failed to create event: ' + error.message)
    }
  }

  const toggleDay = (day: string, force?: boolean) => {
    setSelectedDays(prev => {
      const isSelected = prev.includes(day)
      const newValue = typeof force === 'boolean' ? force : !isSelected

      if (isSelected === newValue) return prev

      return newValue
        ? [...prev, day]
        : prev.filter(d => d !== day)
    })
  }

  const handleDateSelect = (
    range: DateRange | undefined,
    selectedDay: Date,
  ) => {
     if (!selectedDay) {
        setDateRange(range)
        return
     }

     const { from, to } = dateRange || {}
     const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString()

     // 1. Endpoint Toggle Logic (Top Priority)
     if (from && isSameDay(selectedDay, from)) {
        setDateRange(to ? { from: to, to: undefined } : undefined)
        return
     }
     if (to && isSameDay(selectedDay, to)) {
        setDateRange({ from, to: undefined })
        return
     }

     // 2. Smart Shrink (Click Inside)
     // Only trigger if we have a full range AND RDP thinks it's a reset/single-click (range.to is missing or single day)
     // This preserves Drag functionality (where range would be a new valid range)
     if (from && to && selectedDay > from && selectedDay < to) {
        // If RDP output implies a reset (single day selection), we override with Shrink.
        // If RDP output is a full range (drag), we likely want to trust RDP.
        const isRDPReset = !range?.to || isSameDay(range.from!, range.to!)

        if (isRDPReset) {
             const distFrom = Math.abs(selectedDay.getTime() - from.getTime())
             const distTo = Math.abs(selectedDay.getTime() - to.getTime())
             if (distFrom <= distTo) {
                  setDateRange({ from: selectedDay, to })
             } else {
                  setDateRange({ from, to: selectedDay })
             }
             return
        }
     }

     // 3. Fallback to RDP Behavior (Jumps, Drags, Extensions)
     setDateRange(range)
  }

  // Generate time options
  const timeOptions = []
  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12
    const ampm = i < 12 ? 'AM' : 'PM'

    // Hour:00
    timeOptions.push({
        value: `${i.toString().padStart(2, '0')}:00`,
        label: `${hour}:00 ${ampm}`
    })

    // Hour:30
    timeOptions.push({
        value: `${i.toString().padStart(2, '0')}:30`,
        label: `${hour}:30 ${ampm}`
    })
  }







  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Only show if authenticated */}
      {isAuthenticated && <Sidebar />}

      {/* Main Content */}
      <main className={cn("min-h-screen transition-all duration-300 flex-1 min-w-0", isAuthenticated ? "md:ml-72" : "")}>
         {/* Top Navigation Bar */}
         <div className="p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
               <Link to={backLink} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 pr-4 rounded-full hover:bg-muted/50">
                 <ArrowLeft className="h-4 w-4" />
                 {backLabel}
               </Link>
               {searchParams.get('teamId') && (
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold shadow-sm border border-primary/20">
                    <Users className="h-4 w-4" />
                    Creating for Engineering Team
                 </div>
               )}
         </div>

         <div className="max-w-5xl mx-auto px-4 pb-24">
           <form onSubmit={handleCreate} className="space-y-12">
            {/* Header / Event Name */}
            <div className="flex flex-col gap-6 items-center justify-center text-center max-w-3xl mx-auto">
              <div className="relative w-full group">
                  <Input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="New Event Name"
                    className="text-3xl md:text-4xl font-bold text-center border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/20 h-auto py-2 px-4 w-full bg-transparent break-words whitespace-normal tracking-tight transition-all"
                    required
                    autoFocus
                  />
                  {/* Subtle underline effect on focus/hover */}
                  <div className="absolute bottom-2 left-1/4 right-1/4 h-px bg-foreground/10 group-focus-within:bg-primary/50 transition-colors" />
              </div>
              <p className="text-muted-foreground text-lg">Let's get everyone together. Start by giving it a name.</p>
            </div>

            {/* Columns Container */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

              {/* Left Column: Dates/Days */}
              <div className="flex flex-col gap-6 w-full h-full">
                <div className="flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
                     <h3 className="text-lg font-semibold tracking-tight">When is it happening?</h3>
                </div>

                <Card className="p-1 border shadow-sm shadow-black/5 bg-card/60 backdrop-blur-sm flex flex-col items-center flex-1 min-h-[350px] rounded-xl overflow-hidden ring-1 ring-black/5">
                   <div className="w-full p-4 border-b bg-muted/30">
                     {/* Toggle Inside Card */}
                      <div className="flex bg-muted p-1 rounded-lg w-full max-w-sm mx-auto shadow-inner">
                       <button
                           type="button"
                           className={cn("flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200", mode === 'date' ? "bg-background shadow-sm text-foreground scale-[1.02]" : "text-muted-foreground hover:text-foreground")}
                           onClick={() => setMode('date')}
                       >
                           Specific Dates
                       </button>
                       <button
                           type="button"
                           className={cn("flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200", mode === 'days' ? "bg-background shadow-sm text-foreground scale-[1.02]" : "text-muted-foreground hover:text-foreground")}
                           onClick={() => setMode('days')}
                       >
                           Days of Week
                       </button>
                     </div>
                   </div>

                   <div className="flex-1 w-full p-6 flex flex-col items-center justify-center">
                   {mode === 'date' ? (
                       <div className="flex flex-col items-center w-full">
                           {/* Custom Static Navigation */}
                           <div className="flex items-center justify-between w-full max-w-[280px] mb-4">
                               <Button
                                   type="button"
                                   variant="outline"
                                   size="icon"
                                   className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-muted"
                                   onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                               >
                                   <ChevronLeft className="h-4 w-4" />
                               </Button>
                               <span className="text-base font-semibold capitalize">
                                   {format(currentMonth, 'MMMM yyyy')}
                               </span>
                               <Button
                                   type="button"
                                   variant="outline"
                                   size="icon"
                                   className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-muted"
                                   onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                               >
                                   <ChevronRight className="h-4 w-4" />
                               </Button>
                           </div>

                           <Calendar
                             mode="range"
                             selected={dateRange}
                             onSelect={handleDateSelect}
                             month={currentMonth}
                             onMonthChange={setCurrentMonth}
                             className="rounded-lg border-2 border-muted/20 p-4 shadow-sm bg-background"
                             numberOfMonths={1}
                             classNames={{
                                 caption: 'hidden',
                                 nav: 'hidden',
                                 day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-none [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-none last:[&:has([aria-selected])]:rounded-none focus-within:relative focus-within:z-20",
                                 day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-none"),
                                 selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-none",
                                 today: "bg-accent/50 text-accent-foreground font-bold rounded-none",
                             }}
                           />
                           {dateRange?.from && (
                             <div className="mt-6 text-sm font-medium bg-primary/5 text-primary px-4 py-2 rounded-full border border-primary/10">
                                {format(dateRange.from, 'MMM d')}
                                {dateRange.to && ` — ${format(dateRange.to, 'MMM d, yyyy')}`}
                             </div>
                           )}
                       </div>
                   ) : (
                       <div className="flex flex-col gap-3 w-full max-w-[260px]">
                           {daysOfWeek.map(day => {
                               const isSelected = selectedDays.includes(day);
                               return (
                               <label
                                   key={day}
                                   className={cn(
                                       "flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer border-2",
                                       isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:bg-muted/50"
                                   )}
                               >
                                   <Checkbox
                                     id={day}
                                     checked={isSelected}
                                     onCheckedChange={(checked) => toggleDay(day, checked as boolean)}
                                     className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                   />
                                   <span
                                     className={cn("text-base font-medium leading-none cursor-pointer flex-1", isSelected ? "text-primary" : "text-muted-foreground")}
                                   >
                                     {day}
                                   </span>
                                   {isSelected && <div className="h-2 w-2 rounded-full bg-primary animate-in zoom-in" />}
                               </label>
                           )})}
                            <div className="mt-4 text-center">
                                <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                                    {selectedDays.length} days selected
                                </span>
                            </div>
                       </div>
                   )}
                   </div>
                </Card>
              </div>

              {/* Right Column: Times */}
              <div className="flex flex-col gap-6 w-full h-full">
                 <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                     <h3 className="text-xl font-semibold tracking-tight">What times might work?</h3>
                </div>

                <Card className="p-6 border shadow-sm shadow-black/5 bg-card/60 backdrop-blur-sm space-y-6 flex flex-col justify-center flex-1 min-h-[350px] rounded-xl ring-1 ring-black/5 relative overflow-hidden">
                   {/* Decorative background element */}
                   <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="space-y-6 relative z-10">
                      <div className="grid gap-2">
                        <Label htmlFor="earliest" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">No earlier than</Label>
                        <Select
                          value={earliestTime}
                          onValueChange={setEarliestTime}
                        >
                          <SelectTrigger id="earliest" className="h-11 text-base px-3 rounded-lg border-muted-foreground/20 bg-background/50 hover:bg-background transition-colors focus:ring-primary/20">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={`start-${t.value}`} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="latest" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">No later than</Label>
                        <Select
                          value={latestTime}
                          onValueChange={setLatestTime}
                        >
                          <SelectTrigger id="latest" className="h-11 text-base px-3 rounded-lg border-muted-foreground/20 bg-background/50 hover:bg-background transition-colors focus:ring-primary/20">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={`end-${t.value}`} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  </div>

                  <div className="pt-8 mt-auto border-t border-dashed border-border/60">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Time Zone</span>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="font-semibold text-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                      </div>
                    </div>
                   </div>
                </Card>
              </div>
            </div>

            {/* Bottom Action Bar (Fixed/Floating) */}
            <div className={cn(
                "fixed bottom-0 right-0 p-6 bg-background/80 backdrop-blur-lg border-t z-40 transition-all duration-300",
                isAuthenticated ? "left-0 md:left-72" : "left-0"
            )}>
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="hidden md:block text-sm text-muted-foreground">
                        {mode === 'date' && dateRange?.from ? (
                           <span>Selected: <span className="font-medium text-foreground">{format(dateRange.from, 'MMM d')} - {dateRange.to ? format(dateRange.to, 'MMM d') : '...'}</span></span>
                        ) : (
                           <span>Almost done!</span>
                        )}
                    </div>
                    <div className="flex items-center gap-6 ml-auto">
                        <span className="text-muted-foreground font-medium hidden sm:inline-block">Ready to schedule?</span>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-11 px-6 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full"
                            disabled={
                                !eventName ||
                                (mode === 'date' && !dateRange?.from) ||
                                (mode === 'days' && selectedDays.length === 0)
                            }>
                            Create Event
                            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                    </div>
                </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

