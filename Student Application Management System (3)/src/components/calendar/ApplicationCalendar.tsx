import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Badge } from '../ui/badge';
import { Application, ApplicationStatus } from '../../lib/types';
import { ApplicationStatusBadge } from '../shared/ApplicationStatusBadge';
import { Link } from 'react-router-dom';

type CalendarView = 'day' | 'week' | 'month';

interface ApplicationCalendarProps {
  applications: Application[];
  portalType?: 'agent' | 'staff';
}

export function ApplicationCalendar({ applications, portalType = 'agent' }: ApplicationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');

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

  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getApplicationsForDate = (date: Date) => {
    return applications.filter(app => {
      const appDate = new Date(app.submittedAt);
      return isSameDate(appDate, date);
    });
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.SUBMITTED]: 'bg-blue-500',
      [ApplicationStatus.UNDER_REVIEW]: 'bg-yellow-500',
      [ApplicationStatus.OFFER_SENT]: 'bg-purple-500',
      [ApplicationStatus.OFFER_ACCEPTED]: 'bg-green-500',
      [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: 'bg-orange-500',
      [ApplicationStatus.COE_ISSUED]: 'bg-emerald-500',
      [ApplicationStatus.REJECTED]: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const renderDayView = () => {
    const dayApplications = getApplicationsForDate(currentDate);
    const sortedApps = dayApplications.sort((a, b) => 
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

    return (
      <div className="space-y-2">
        {sortedApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No applications submitted on this day
          </div>
        ) : (
          sortedApps.map((app) => (
            <Link 
              key={app.id} 
              to={`/${portalType}/applications/${app.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1 h-8 rounded-full ${getStatusColor(app.status)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{app.studentName}</p>
                          <p className="text-sm text-muted-foreground truncate">{app.course}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground ml-3">
                        <Badge variant="outline" className="text-xs">
                          {app.referenceNumber}
                        </Badge>
                        <span>•</span>
                        <span>{app.destination}</span>
                        <span>•</span>
                        <span>{app.intake}</span>
                        <span>•</span>
                        <span>{new Date(app.submittedAt).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayApplications = getApplicationsForDate(day);
          const today = isToday(day);

          return (
            <div 
              key={index} 
              className={`border rounded-lg p-3 min-h-[200px] ${
                today ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500' : 'bg-card'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm font-medium ${today ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1.5">
                {dayApplications.slice(0, 3).map((app) => (
                  <Link 
                    key={app.id} 
                    to={`/${portalType}/applications/${app.id}`}
                    className="block"
                  >
                    <div className={`text-xs p-2 rounded ${getStatusColor(app.status)} bg-opacity-10 hover:bg-opacity-20 transition-colors cursor-pointer border border-current border-opacity-20`}>
                      <p className="font-medium truncate text-foreground">{app.studentName}</p>
                      <p className="text-muted-foreground truncate text-[10px] mt-0.5">
                        {new Date(app.submittedAt).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
                {dayApplications.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground py-1">
                    +{dayApplications.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayApplications = getApplicationsForDate(day);
            const today = isToday(day);

            return (
              <div 
                key={index} 
                className={`border rounded-lg p-2 aspect-square flex flex-col ${
                  today ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500' : 'bg-card'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="flex-1 overflow-hidden space-y-0.5">
                  {dayApplications.slice(0, 2).map((app) => (
                    <Link 
                      key={app.id} 
                      to={`/${portalType}/applications/${app.id}`}
                      className="block"
                    >
                      <div className={`w-full h-1.5 rounded ${getStatusColor(app.status)} cursor-pointer hover:opacity-80 transition-opacity`} 
                           title={`${app.studentName} - ${app.status}`}
                      />
                    </Link>
                  ))}
                  {dayApplications.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{dayApplications.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="font-medium ml-2">{formatDateHeader()}</h3>
        </div>

        <ToggleGroup 
          type="single" 
          value={view} 
          onValueChange={(value) => value && setView(value as CalendarView)}
          variant="outline"
        >
          <ToggleGroupItem value="day" aria-label="Day view">
            Day
          </ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="Week view">
            Week
          </ToggleGroupItem>
          <ToggleGroupItem value="month" aria-label="Month view">
            Month
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-4">
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </CardContent>
      </Card>
    </div>
  );
}
