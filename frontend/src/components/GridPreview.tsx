import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Check, Users, MousePointer2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PARTICIPANTS = [
  { name: 'Sarah', color: 'bg-blue-500' },
  { name: 'Alex', color: 'bg-green-500' },
  { name: 'Jordan', color: 'bg-purple-500' },
  { name: 'Taylor', color: 'bg-orange-500' },
]

const DAYS = ['Mon', 'Tue', 'Wed']
const HOURS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM']

export function GridPreview() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set(['1-1', '1-2', '2-2', '4-4']))
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Dummy data for others
  const [othersAvailability] = useState<Map<string, string[]>>(() => {
    const m = new Map()
    // Sarah's availability
    ;['0-0', '1-0', '2-0', '1-1', '2-1'].forEach(s => m.set(s, ['Sarah']))
    // Alex's availability
    ;['1-1', '2-1', '1-2', '2-2'].forEach(s => m.set(s, [...(m.get(s) || []), 'Alex']))
    // Jordan's availability
    ;['0-1', '1-1', '2-1', '4-2'].forEach(s => m.set(s, [...(m.get(s) || []), 'Jordan']))
    return m
  })

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const handleMouseDown = (slotId: string) => {
    setIsDragging(true)
    toggleSlot(slotId)
  }

  const handleMouseEnter = (slotId: string) => {
    setHoveredSlot(slotId)
    if (isDragging) toggleSlot(slotId)
  }

  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const getSlotDetails = (slotId: string) => {
    const people = [...(othersAvailability.get(slotId) || [])]
    if (selectedSlots.has(slotId)) people.push('You')
    return people
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-start select-none">
      {/* Sidebar: Participants */}
      <Card className="md:col-span-1 shadow-2xl bg-white/80 backdrop-blur-xl border-white/20 ring-1 ring-black/5 flex flex-row md:flex-col items-center md:items-stretch overflow-hidden">
        <CardHeader className="pb-0 md:pb-4 px-4 md:px-6 py-3 md:py-6 border-r md:border-r-0 md:border-b border-border/10">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-row md:flex-col gap-3 p-2 md:p-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] items-center md:items-stretch">
          {PARTICIPANTS.map(p => {
            const isAvailable = hoveredSlot && getSlotDetails(hoveredSlot).includes(p.name)
            return (
              <div key={p.name} className={cn(
                "flex-shrink-0 flex items-center justify-center md:justify-start gap-2 md:gap-3 p-1 rounded-lg transition-all duration-300 group",
                isAvailable ? "bg-primary/10 scale-105 translate-x-0 md:translate-x-1" : "opacity-60"
              )}>
                <Avatar className="h-8 w-8 md:h-8 md:w-8 border-2 border-background shadow-sm ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                  <AvatarFallback className={cn("text-[10px] font-bold text-white", p.color)}>
                    {p.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold">{p.name}</span>
                  {isAvailable && <span className="text-[10px] text-primary font-medium animate-pulse">Available</span>}
                </div>
              </div>
            )
          })}
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center md:justify-start gap-2 md:gap-3 p-1 rounded-lg transition-all border border-dashed border-primary/20",
            hoveredSlot && selectedSlots.has(hoveredSlot) ? "bg-primary/10 border-solid" : "opacity-40"
          )}>
            <Avatar className="h-8 w-8 md:h-8 md:w-8">
              <AvatarFallback className="text-[10px] font-bold bg-primary text-white">Y</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-xs font-semibold">You</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Card */}
      <Card className="md:col-span-4 shadow-2xl bg-white/80 backdrop-blur-xl border-white/20 ring-1 ring-black/5 flex flex-col min-h-[450px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-white/40">
          <div>
            <CardTitle className="text-lg text-slate-900">Group Heatmap</CardTitle>
            <CardDescription className="text-xs text-slate-500">Paint your availability to see where the team overlaps</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span>You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
              <span>Others</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 bg-white/20">
          <div className="p-2 sm:p-6">
            <div
              className="grid gap-px bg-slate-200/50 border border-slate-200/50 rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `45px repeat(${DAYS.length}, 1fr)` }}
            >
              {/* Header */}
              <div className="bg-white/70"></div>
              {DAYS.map(day => (
                <div key={day} className="bg-white/70 p-2 sm:p-4 text-center text-[10px] sm:text-xs font-bold text-slate-900 flex items-center justify-center">
                  {day}
                </div>
              ))}

              {/* Rows */}
              {HOURS.map((hour, i) => (
                <div key={hour} className="contents">
                  <div className="bg-white/60 min-w-[50px] p-2 text-[10px] text-right text-slate-600 flex items-center justify-end font-medium">
                    {hour}
                  </div>
                  {DAYS.map((_, j) => {
                    const slotId = `${i}-${j}`
                    const isSelected = selectedSlots.has(slotId)
                    const details = getSlotDetails(slotId)
                    const totalCount = details.length

                    // Intensity calculation
                    const intensity = totalCount / (PARTICIPANTS.length + 1)

                    return (
                      <div
                        key={slotId}
                        onMouseDown={() => handleMouseDown(slotId)}
                        onMouseEnter={() => handleMouseEnter(slotId)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={cn(
                          "bg-white h-16 cursor-pointer transition-all relative group border-t border-dashed border-slate-100",
                          "hover:ring-2 hover:ring-primary/20 hover:z-10",
                          isSelected && "bg-primary/20"
                        )}
                      >
                        {totalCount > 0 && (
                          <div
                            className={cn(
                              "absolute inset-0 transition-all duration-500",
                              isSelected ? "bg-primary" : "bg-primary"
                            )}
                            style={{ opacity: isSelected ? 0.8 : intensity * 0.4 }}
                          />
                        )}

                        {isSelected && !hoveredSlot && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Check className="h-3 w-3 text-white opacity-40" />
                           </div>
                        )}

                        {/* Hover Tooltip */}
                        <div className={cn(
                          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-xl transition-all duration-200 pointer-events-none z-50 whitespace-nowrap",
                          hoveredSlot === slotId ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        )}>
                          <div className="font-bold border-b border-white/20 pb-0.5 mb-1 text-center">
                            {totalCount} Available
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {details.map(name => (
                              <span key={name} className={cn(name === 'You' && "text-primary-foreground font-bold")}>
                                • {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-bounce">
                <MousePointer2 className="h-4 w-4" />
                <span>Try dragging to paint your own time</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature highlights below grid - simplified */}
      <div className="lg:col-span-5 grid md:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col items-center text-center p-2">
              <h4 className="font-bold text-sm mb-1 text-slate-900">Instant Heatmap</h4>
              <p className="text-[11px] text-slate-500">See exactly when everyone overlaps without guessing.</p>
          </div>
          <div className="flex flex-col items-center text-center p-2">
              <h4 className="font-bold text-sm mb-1 text-slate-900">Drag to Paint</h4>
              <p className="text-[11px] text-slate-500">Intuitive interaction that actually feels like coloring.</p>
          </div>
          <div className="flex flex-col items-center text-center p-2">
              <h4 className="font-bold text-sm mb-1 text-slate-900">Anonymous Mode</h4>
              <p className="text-[11px] text-slate-500">Quick events don't even require an account to join.</p>
          </div>
      </div>
    </div>
  )
}
