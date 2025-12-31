import { useState } from 'react';
import { Search, CheckCircle, Clock, FileText, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { mockApplications } from '../../lib/mockData';

export default function StudentTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = () => {
    // In real app, this would call the tracking API
    const found = mockApplications.find(
      (app) => app.referenceNumber.toLowerCase() === trackingId.toLowerCase()
    );
    setApplication(found || null);
    setSearched(true);
  };

  const stages = [
    {
      id: 'submitted',
      label: 'Application Submitted',
      description: 'Your application has been received',
      icon: FileText,
      completed: true,
    },
    {
      id: 'review',
      label: 'Under Review',
      description: 'Application is being reviewed by staff',
      icon: Clock,
      completed: application?.status !== 'submitted',
    },
    {
      id: 'offer',
      label: 'Offer Sent',
      description: 'Conditional offer letter has been sent',
      icon: Award,
      completed: application?.status === 'offer_sent' ||
        application?.status === 'offer_accepted' ||
        application?.status === 'coe_issued',
    },
    {
      id: 'gs',
      label: 'GS Assessment',
      description: 'Genuine Student assessment in progress',
      icon: CheckCircle,
      completed: application?.status === 'gs_approved' || application?.status === 'coe_issued',
    },
    {
      id: 'payment',
      label: 'Fee Payment',
      description: 'Awaiting tuition fee payment',
      icon: DollarSign,
      completed: application?.status === 'coe_issued',
    },
    {
      id: 'coe',
      label: 'COE Issued',
      description: 'Confirmation of Enrollment issued',
      icon: CheckCircle,
      completed: application?.status === 'coe_issued',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl">Track Your Application</h1>
        <p className="text-lg text-muted-foreground">
          Enter your reference number to check your application status
        </p>
      </div>

      {/* Search card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking ID (e.g., CHU-2024-00001)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              className="flex-1"
            />
            <Button onClick={handleTrack} className="gap-2">
              <Search className="h-4 w-4" />
              Track
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your tracking ID was sent to your email when the application was submitted
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && !application && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No application found with tracking ID: <strong>{trackingId}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your tracking ID and try again
            </p>
          </CardContent>
        </Card>
      )}

      {application && (
        <div className="space-y-6">
          {/* Application info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>Reference: {application.referenceNumber}</CardDescription>
                </div>
                <Badge className="bg-blue-500 text-white">
                  {application.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p>{application.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p>{application.course}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p>{application.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Intake</p>
                  <p>{application.intake}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                  <p>{new Date(application.submittedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p>{new Date(application.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
              <CardDescription>Track your application through each stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  const isLast = index === stages.length - 1;
                  
                  return (
                    <div key={stage.id} className="flex gap-4">
                      {/* Icon and line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                            stage.completed
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 bg-background text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-[40px] ${
                              stage.completed ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2">
                          <h4 className={stage.completed ? '' : 'text-muted-foreground'}>
                            {stage.label}
                          </h4>
                          {stage.completed && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stage.description}
                        </p>
                        
                        {/* Action buttons for specific stages */}
                        {stage.id === 'offer' && stage.completed && application.status === 'offer_sent' && (
                          <Button variant="outline" size="sm" className="mt-3">
                            View & Sign Offer Letter
                          </Button>
                        )}
                        {stage.id === 'gs' && stage.completed && application.status === 'gs_documents_pending' && (
                          <Button variant="outline" size="sm" className="mt-3">
                            Upload GS Documents
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Next steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {application.status === 'offer_sent' && (
                <div className="space-y-2">
                  <p>🎉 Congratulations! Your offer letter has been sent.</p>
                  <p className="text-sm text-muted-foreground">
                    Please review and sign the offer letter within 14 days. Check your email for the secure link.
                  </p>
                </div>
              )}
              {application.status === 'gs_documents_pending' && (
                <div className="space-y-2">
                  <p>📄 Please submit your GS (Genuine Student) documents.</p>
                  <p className="text-sm text-muted-foreground">
                    You will receive an email with a secure link to upload the required documents.
                  </p>
                </div>
              )}
              {application.status === 'gs_interview_scheduled' && (
                <div className="space-y-2">
                  <p>📹 Your GS interview has been scheduled.</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for the interview details and meeting link.
                  </p>
                </div>
              )}
              {application.status === 'fee_payment_pending' && (
                <div className="space-y-2">
                  <p>💳 Please proceed with tuition fee payment.</p>
                  <p className="text-sm text-muted-foreground">
                    Payment details have been sent to your email.
                  </p>
                </div>
              )}
              {application.status === 'coe_issued' && (
                <div className="space-y-2">
                  <p>✅ Your COE has been issued!</p>
                  <p className="text-sm text-muted-foreground">
                    The Confirmation of Enrollment has been sent to your agent. You can now proceed with visa application.
                  </p>
                </div>
              )}
              {application.status === 'under_review' && (
                <div className="space-y-2">
                  <p>⏳ Your application is under review.</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is reviewing your documents. You will be notified of any updates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support card */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                Have questions about your application?{' '}
                <span className="text-primary cursor-pointer hover:underline">
                  Contact your agent
                </span>{' '}
                or email us at{' '}
                <a href="mailto:admissions@churchill.edu" className="text-primary hover:underline">
                  admissions@churchill.edu
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
