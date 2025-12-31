import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Video, Calendar, Clock } from 'lucide-react';
import { mockInterviews, mockApplications } from '../../lib/mockData';
import { InterviewCalendar } from '../../components/calendar/InterviewCalendar';

export default function StaffInterviews() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleJoinMeeting = (interviewId: string) => {
    console.log('Join meeting:', interviewId);
  };

  const handleViewDetails = (interviewId: string) => {
    console.log('View details:', interviewId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Manage and conduct Genuine Student assessment interviews
          </p>
        </div>
        <Button className="gap-2 w-fit">
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Calendar View */}
      <InterviewCalendar
        interviews={mockInterviews}
        applications={mockApplications}
        onJoinMeeting={handleJoinMeeting}
        onViewDetails={handleViewDetails}
      />

      {/* Upcoming Interviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>All scheduled GS assessment sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {mockInterviews.length > 0 ? (
            <div className="space-y-4">
              {mockInterviews.map((interview) => {
                const app = mockApplications.find(a => a.id === interview.applicationId);
                return (
                  <div key={interview.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{app?.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {app?.course}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{app?.referenceNumber}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(interview.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleViewDetails(interview.id)}>
                        Details
                      </Button>
                      <Button onClick={() => handleJoinMeeting(interview.id)}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming interviews scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
