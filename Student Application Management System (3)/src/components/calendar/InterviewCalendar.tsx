import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Video, Calendar, ChevronLeft, ChevronRight, List, CalendarDays, Clock } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { cn } from '../ui/utils';
import React from 'react';

type CalendarView = 'day' | 'week' | 'month';

interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  status: string;
}

interface Application {
  id: string;
  studentName: string;
  course: string;
  referenceNumber: string;
}

interface InterviewCalendarProps {
  interviews: Interview[];
  applications: Application[];
  onJoinMeeting?: (interviewId: string) => void;
  onViewDetails?: (interviewId: string) => void;
}

export function InterviewCalendar({ interviews, applications, onJoinMeeting, onViewDetails }: InterviewCalendarProps) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get current view title
  const getViewTitle = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  // Get start of week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  // Get week days
  const getWeekDays = (date: Date) => {
    const weekStart = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Render Day List View
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[100px_1fr] divide-x">
          <div className="bg-muted/30">
            <div className="h-12 border-b flex items-center justify-center text-xs">Time</div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b flex items-start justify-center pt-2 text-xs text-muted-foreground">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          <div className="bg-background">
            <div className="h-12 border-b flex items-center px-4">
              <span className="text-sm">Interviews</span>
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b" />
              ))}
              
              {interviews.slice(0, 2).map((interview, idx) => {
                const app = applications.find(a => a.id === interview.applicationId);
                return (
                  <div
                    key={interview.id}
                    className="absolute left-2 right-2 bg-primary/10 border-l-4 border-primary rounded p-3 cursor-pointer hover:bg-primary/20 transition-colors"
                    style={{ top: `${(idx + 2) * 80 + 12}px`, height: '64px' }}
                    onClick={() => onViewDetails?.(interview.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{app?.studentName}</p>
                        <p className="text-xs text-muted-foreground truncate">{app?.course}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{app?.referenceNumber}</Badge>
                          <span className="text-xs text-muted-foreground">{formatTime(interview.scheduledAt)}</span>
                        </div>
                      </div>
                      <Video className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] divide-x">
            <div className="bg-muted/30 h-12 border-b flex items-center justify-center text-xs">
              Time
            </div>
            {weekDays.map((day) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={day.toISOString()} className={cn(
                  "h-12 border-b flex flex-col items-center justify-center",
                  isToday ? "bg-primary/5" : "bg-muted/30"
                )}>
                  <span className="text-xs text-muted-foreground">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={cn(
                    "text-sm",
                    isToday && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
                  )}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}

            {hours.map((hour) => (
              <React.Fragment key={`hour-${hour}`}>
                <div className="bg-muted/30 h-16 border-b flex items-start justify-center pt-2 text-xs text-muted-foreground">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                {weekDays.map((day) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const shouldShowInterview = day.getDay() === 2 && hour === 10;
                  const interview = shouldShowInterview ? interviews[0] : null;
                  const app = interview ? applications.find(a => a.id === interview.applicationId) : null;

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        "h-16 border-b p-1 hover:bg-muted/50 cursor-pointer transition-colors",
                        isToday && "bg-primary/5"
                      )}
                      onClick={() => interview && onViewDetails?.(interview.id)}
                    >
                      {interview && app && (
                        <div className="bg-primary/10 border-l-2 border-primary rounded px-2 py-1 h-full">
                          <p className="text-xs truncate">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">{formatTime(interview.scheduledAt)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 divide-x bg-muted/30">
          {weekDays.map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-xs">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y">
          {days.map((day, idx) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            const hasInterview = day.isCurrentMonth && day.date.getDate() % 5 === 0;

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] p-2 hover:bg-muted/50 cursor-pointer transition-colors",
                  !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  isToday && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm",
                    isToday && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
                  )}>
                    {day.date.getDate()}
                  </span>
                </div>
                
                {hasInterview && applications[0] && (
                  <div className="space-y-1">
                    <div className="bg-primary/10 border-l-2 border-primary rounded px-2 py-1 text-xs truncate">
                      Interview - {applications[0].studentName}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <CardTitle className="ml-2">{getViewTitle()}</CardTitle>
          </div>

          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as CalendarView)} variant="outline" className="justify-start lg:justify-end">
            <ToggleGroupItem value="day" aria-label="Day view">
              <List className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Day</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view">
              <CalendarDays className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Week</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month view">
              <Calendar className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Month</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
}