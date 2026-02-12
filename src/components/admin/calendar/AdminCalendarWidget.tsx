import { useState } from 'react';
import { GlassCard } from '@/components/glass-ui/GlassCard';
import { GlassButton } from '@/components/glass-ui/GlassButton';
import { GlassBadge } from '@/components/glass-ui/GlassBadge';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useCalendarData, EventIndicator } from '@/hooks/calendar/useCalendarData';
import { QuickEventDialog } from './QuickEventDialog';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminCalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const { dates, loading } = useCalendarData(year, month);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const clearSelectedDate = () => {
    setSelectedDate(null);
  };

  const handleEventClick = (eventId: string, eventType: string) => {
    if (eventType === 'order') {
      // Keep existing behavior for orders - navigate to order page
      return;
    }
    // For all other event types, open the detail modal
    setSelectedEventId(eventId);
    setShowEventDetailModal(true);
  };

  const getDateIndicators = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return dates.get(dateKey) || [];
  };

  // Get filtered events for the right panel
  const getFilteredEvents = (): { type: 'single'; data: EventIndicator[] } | { type: 'grouped'; data: [string, EventIndicator[]][] } => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      return { type: 'single', data: dates.get(dateKey) || [] };
    }
    // Show upcoming events from today forward for current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const grouped = Array.from(dates.entries())
      .filter(([dateKey]) => {
        const date = new Date(dateKey);
        return isSameMonth(date, currentDate) && date >= today;
      })
      .sort(([a], [b]) => a.localeCompare(b));
    return { type: 'grouped', data: grouped };
  };

  const filteredEvents = getFilteredEvents();
  
  // Calculate total event count
  const totalEventCount = filteredEvents.type === 'single' 
    ? filteredEvents.data.reduce((sum, ind) => sum + (ind.events?.length || 0), 0)
    : filteredEvents.data.reduce((sum, [_, indicators]) => 
        sum + indicators.reduce((s, ind) => s + (ind.events?.length || 0), 0), 0
      );

  return (
    <>
      <GlassCard variant="elevated" className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Compact Calendar */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-1">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={nextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>

            <GlassButton
              onClick={() => {
                setSelectedDate(new Date());
                setShowEventDialog(true);
              }}
              className="gap-2 w-full mb-4"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </GlassButton>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-semibold text-muted-foreground py-1"
                >
                  {day}
                </div>
              ))}

              {/* Date Cells */}
              {calendarDays.map((date, index) => {
                const indicators = getDateIndicators(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);
                const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "relative w-8 h-8 rounded-full transition-all duration-200",
                      "flex flex-col items-center justify-center",
                      "hover:bg-white/30 hover:scale-110",
                      isCurrentDay && "ring-2 ring-primary",
                      isSelected && "bg-primary/20 ring-2 ring-primary/50",
                      !isCurrentMonth && "opacity-40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isCurrentDay ? "text-primary font-bold" : "text-foreground"
                    )}>
                      {format(date, 'd')}
                    </span>
                    
                    {/* Event Indicators */}
                    {indicators.length > 0 && (
                      <div className="flex gap-0.5 absolute bottom-0.5">
                        {indicators.slice(0, 3).map((indicator, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: indicator.color }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/30">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-xs text-muted-foreground">Events</span>
              </div>
            </div>
          </div>

          {/* Right: Events List */}
          <div className="lg:col-span-3 border-l border-white/30 lg:pl-10 pl-6 lg:pr-4 pr-4 pt-2">
            {/* Enhanced Header */}
            <div className="bg-white/5 -mx-4 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">
                      {selectedDate 
                        ? format(selectedDate, 'MMMM d, yyyy')
                        : `${format(currentDate, 'MMMM yyyy')}`
                      }
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {totalEventCount} {totalEventCount === 1 ? 'event' : 'events'}
                    </p>
                  </div>
                  {totalEventCount > 0 && (
                    <GlassBadge variant="info" size="sm">
                      {totalEventCount}
                    </GlassBadge>
                  )}
                </div>
                {selectedDate && (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedDate}
                    className="hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Scrollable Events Area with Custom Scrollbar */}
            <div className="relative h-[340px]">
              {/* Top Fade Gradient */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-glass-white to-transparent pointer-events-none z-10" />
              
              <div className="h-full overflow-y-auto pr-2 scroll-smooth custom-scrollbar">
                {loading ? (
                  // Loading Skeletons
                  <div className="space-y-3 animate-fade-in">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/30 bg-white/5 backdrop-blur-glass">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-1.5 h-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredEvents.type === 'single' ? (
                  // Show events for selected date
                  filteredEvents.data.length > 0 ? (
                    <div className="space-y-3 animate-fade-in">
                      {filteredEvents.data.map((indicator, idx) => (
                        <div key={idx} className="space-y-2">
                          {indicator.events?.map((event: any, eventIdx: number) => (
                            <GlassCard 
                              key={event.id} 
                              className={cn(
                                "p-4 hover:bg-white/30 hover:shadow-glass-lg transition-all duration-300",
                                "hover:scale-[1.02] border-l-2 cursor-pointer",
                                "animate-fade-in"
                              )}
                              style={{ 
                                borderLeftColor: indicator.color,
                                animationDelay: `${eventIdx * 50}ms`
                              }}
                              onClick={() => handleEventClick(event.id, indicator.type)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-1.5 h-full rounded-full mt-1 shadow-sm"
                                  style={{ backgroundColor: indicator.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <h4 className="font-semibold text-sm text-foreground truncate">
                                      {event.title}
                                    </h4>
                                    <GlassBadge variant="info" size="sm">
                                      {(event.event_type || indicator.type).charAt(0).toUpperCase() + (event.event_type || indicator.type).slice(1)}
                                    </GlassBadge>
                                  </div>
                                  {event.start_time && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span className="font-medium">
                                        {format(new Date(event.start_time.replace('Z', '')), 'h:mm a')}
                                      </span>
                                    </div>
                                  )}
                                  {event.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                      {event.description}
                                    </p>
                                  )}
                                  {indicator.type === 'order' && event.id && (
                                    <Link 
                                      to={`/admin/orders/${event.id}`}
                                      className="text-xs text-brand hover:underline mt-2 inline-flex items-center gap-1 font-medium transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View Order →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </GlassCard>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground animate-fade-in">
                      <Calendar className="w-16 h-16 mx-auto mb-3 opacity-40 animate-pulse" />
                      <p className="text-sm font-medium mb-1">No events on this date</p>
                      <p className="text-xs opacity-70">Select a different date or add a new event</p>
                      <GlassButton
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setSelectedDate(selectedDate || new Date());
                          setShowEventDialog(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Create Event
                      </GlassButton>
                    </div>
                  )
                ) : (
                  // Show all events for current month grouped by date
                  filteredEvents.data.length > 0 ? (
                    <div className="space-y-6">
                      {filteredEvents.data.map(([dateKey, indicators], groupIdx) => (
                        <div key={dateKey} className="animate-fade-in" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                          {/* Sticky Date Header */}
                          <div className="bg-white/10 px-3 py-2 rounded-lg sticky top-0 backdrop-blur-sm z-20 mb-3 border border-white/20">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                              {format(new Date(dateKey), 'EEEE, MMMM d')}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {indicators.map((indicator, idx) => (
                              <div key={idx}>
                                {indicator.events?.map((event: any, eventIdx: number) => (
                                  <GlassCard 
                                    key={event.id} 
                                    className={cn(
                                      "p-4 hover:bg-white/30 hover:shadow-glass-lg transition-all duration-300",
                                      "hover:scale-[1.02] border-l-2 cursor-pointer mb-2",
                                      "animate-fade-in"
                                    )}
                                    style={{ 
                                      borderLeftColor: indicator.color,
                                      animationDelay: `${(groupIdx * 100) + (eventIdx * 50)}ms`
                                    }}
                                    onClick={() => handleEventClick(event.id, indicator.type)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className="w-1.5 h-full rounded-full mt-1 shadow-sm"
                                        style={{ backgroundColor: indicator.color }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <h4 className="font-semibold text-sm text-foreground truncate">
                                            {event.title}
                                          </h4>
                                          <GlassBadge variant="info" size="sm">
                                            {(event.event_type || indicator.type).charAt(0).toUpperCase() + (event.event_type || indicator.type).slice(1)}
                                          </GlassBadge>
                                        </div>
                                        {event.start_time && (
                                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="font-medium">
                                              {format(new Date(event.start_time.replace('Z', '')), 'h:mm a')}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </GlassCard>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground animate-fade-in">
                      <Calendar className="w-16 h-16 mx-auto mb-3 opacity-40 animate-pulse" />
                      <p className="text-sm font-medium mb-1">No events this month</p>
                      <p className="text-xs opacity-70">Start planning by creating your first event</p>
                      <GlassButton
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setSelectedDate(new Date());
                          setShowEventDialog(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Create Event
                      </GlassButton>
                    </div>
                  )
                )}
              </div>
              
              {/* Bottom Fade Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-glass-white to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </GlassCard>

      <QuickEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        selectedDate={selectedDate}
      />

      <EventDetailModal
        eventId={selectedEventId}
        open={showEventDetailModal}
        onOpenChange={setShowEventDetailModal}
      />
    </>
  );
}
