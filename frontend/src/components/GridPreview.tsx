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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM']

export function GridPreview() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set(['1-1', '1-2', '2-2', '4-4']))
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Dummy data for others
  const [othersAvailability] = useState<Map<string, string[]>>(() => {
    const m = new Map()
    // Sarah's availability
    ;['0-0', '1-0', '2-0', '1-1', '2-1', '3-1'].forEach(s => m.set(s, ['Sarah']))
    // Alex's availability
    ;['1-1', '2-1', '3-1', '1-2', '2-2', '3-2'].forEach(s => m.set(s, [...(m.get(s) || []), 'Alex']))
    // Jordan's availability
    ;['0-1', '1-1', '2-1', '4-4', '5-4', '6-4'].forEach(s => m.set(s, [...(m.get(s) || []), 'Jordan']))
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
    <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 items-start select-none">
      {/* Sidebar: Participants */}
      <Card className="lg:col-span-1 shadow-2xl bg-white/80 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PARTICIPANTS.map(p => {
            const isAvailable = hoveredSlot && getSlotDetails(hoveredSlot).includes(p.name)
            return (
              <div key={p.name} className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
                isAvailable ? "bg-primary/10 scale-105 translate-x-1" : "opacity-60"
              )}>
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarFallback className={cn("text-[10px] font-bold text-white", p.color)}>
                    {p.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{p.name}</span>
                  {isAvailable && <span className="text-[10px] text-primary font-medium animate-pulse">Available</span>}
                </div>
              </div>
            )
          })}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-all border border-dashed border-primary/20",
            hoveredSlot && selectedSlots.has(hoveredSlot) ? "bg-primary/10 border-solid" : "opacity-40"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[10px] font-bold bg-primary text-white">Y</AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold">You</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Card */}
      <Card className="lg:col-span-4 shadow-2xl bg-white/80 backdrop-blur-xl border-white/20 ring-1 ring-black/5 overflow-hidden flex flex-col h-[500px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-white/40">
          <div>
            <CardTitle className="text-lg">Group Heatmap</CardTitle>
            <CardDescription className="text-xs">Paint your availability to see where the team overlaps</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
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

        <CardContent className="p-0 overflow-auto flex-1 bg-white/20">
          <div className="min-w-[500px] p-6">
            <div
              className="grid gap-px bg-slate-200/50 border border-slate-200/50 rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)` }}
            >
              {/* Header */}
              <div className="bg-white/60"></div>
              {DAYS.map(day => (
                <div key={day} className="bg-white/60 p-3 text-center text-xs font-bold text-slate-500">
                  {day}
                </div>
              ))}

              {/* Rows */}
              {HOURS.map((hour, i) => (
                <div key={hour} className="contents">
                  <div className="bg-white/60 p-2 text-[10px] text-right text-slate-400 flex items-start justify-end -mt-2">
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
                          "bg-white h-12 cursor-pointer transition-all relative group border-t border-dashed border-slate-100",
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

      {/* Feature highlight below grid for larger screens */}
      <div className="lg:col-span-5 grid md:grid-cols-3 gap-6 mt-4">
          <div className="p-4 rounded-xl bg-white/40 border border-white/20 backdrop-blur-sm">
              <h4 className="font-bold text-sm mb-1">Instant Heatmap</h4>
              <p className="text-[11px] text-muted-foreground">See exactly when everyone overlaps without guessing.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/40 border border-white/20 backdrop-blur-sm">
              <h4 className="font-bold text-sm mb-1">Drag to Paint</h4>
              <p className="text-[11px] text-muted-foreground">Intuitive interaction that actually feels like coloring.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/40 border border-white/20 backdrop-blur-sm">
              <h4 className="font-bold text-sm mb-1">Anonymous Mode</h4>
              <p className="text-[11px] text-muted-foreground">Quick events don't even require an account to join.</p>
          </div>
      </div>
    </div>
  )
}
