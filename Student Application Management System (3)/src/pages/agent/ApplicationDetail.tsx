import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, User, Clock, MessageSquare, Mail, Phone, GraduationCap, MapPin, Calendar, UserCheck, Activity, Eye, AlertCircle, CheckCircle2, Send, Edit, X, ChevronRight, PenTool } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { ApplicationStatusBadge } from '../../components/shared/ApplicationStatusBadge';
import { mockApplications, mockGSDocuments, mockCommunicationThreads } from '../../lib/mockData';
import { getActivitiesByApplicationId, addActivity, ActivityActions } from '../../lib/activityLogger';
import { CommunicationThreadStatus, Role, ApplicationStatus } from '../../lib/types';
import { toast } from 'sonner@2.0.3';

export default function AgentApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Load application from both mockData and localStorage
  const [application, setApplication] = useState(() => {
    // First check localStorage for submitted applications
    try {
      const submittedAppsStr = localStorage.getItem('submitted_applications');
      if (submittedAppsStr) {
        const submittedApps = JSON.parse(submittedAppsStr);
        const foundApp = submittedApps.find((app: any) => app.id === id);
        if (foundApp) return foundApp;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    // Fall back to mockApplications
    return mockApplications.find(app => app.id === id);
  });

  useEffect(() => {
    if (!application) {
      toast.error('Application not found');
      navigate('/agent/applications');
    }
  }, [application, navigate]);

  // Load activities from localStorage instead of mockData
  const activities = getActivitiesByApplicationId(id || '');
  const gsDocuments = mockGSDocuments.filter(doc => doc.applicationId === id);
  
  // Load communication threads from localStorage
  const [communicationThreads, setCommunicationThreads] = useState(() => {
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      if (threadsStr) {
        const allThreads = JSON.parse(threadsStr);
        return allThreads.filter((thread: any) => thread.applicationId === id);
      }
    } catch (error) {
      console.error('Error loading threads from localStorage:', error);
    }
    // Fall back to mockData
    return mockCommunicationThreads.filter(thread => thread.applicationId === id);
  });

  // Reload threads from localStorage when component mounts or id changes
  useEffect(() => {
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      if (threadsStr) {
        const allThreads = JSON.parse(threadsStr);
        setCommunicationThreads(allThreads.filter((thread: any) => thread.applicationId === id));
      }
    } catch (error) {
      console.error('Error loading threads from localStorage:', error);
    }
  }, [id]);

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
        <Button onClick={() => navigate('/agent/applications')} className="mt-4">
          Back to Applications
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [newMessage, setNewMessage] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Signature states
  const [agentSigned, setAgentSigned] = useState(() => application?.agentSigned || false);
  const [studentSigned, setStudentSigned] = useState(() => application?.studentSigned || false);
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false);

  const selectedThread = communicationThreads.find(t => t.id === selectedThreadId);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedThreadId) return;

    const messageId = `msg-${Date.now()}`;
    const now = new Date().toISOString();

    const newMessageObj = {
      id: messageId,
      threadId: selectedThreadId,
      message: newMessage.trim(),
      sentBy: 'agent-1', // Current agent ID
      sentByName: application.agentName || 'Agent',
      sentByRole: Role.AGENT,
      sentAt: now,
    };

    // Update local state
    const updatedThreads = communicationThreads.map(thread =>
      thread.id === selectedThreadId
        ? { 
            ...thread, 
            messages: [...thread.messages, newMessageObj],
            updatedAt: now 
          }
        : thread
    );
    setCommunicationThreads(updatedThreads);

    // Update localStorage
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      if (threadsStr) {
        const allThreads = JSON.parse(threadsStr);
        const updatedAllThreads = allThreads.map((thread: any) =>
          thread.id === selectedThreadId
            ? { 
                ...thread, 
                messages: [...thread.messages, newMessageObj],
                updatedAt: now 
              }
            : thread
        );
        localStorage.setItem('communication_threads', JSON.stringify(updatedAllThreads));
      }
    } catch (error) {
      console.error('Error saving message to localStorage:', error);
    }

    // Clear input
    setNewMessage('');
    toast.success('Message sent successfully');
  };

  const handleMarkForReview = () => {
    if (!selectedThreadId) return;

    const thread = communicationThreads.find(t => t.id === selectedThreadId);
    if (!thread) return;

    const now = new Date().toISOString();
    const isMarked = thread.markedForReview || false;
    const newMarkedStatus = !isMarked;

    // Update local state
    const updatedThreads = communicationThreads.map(t =>
      t.id === selectedThreadId
        ? { 
            ...t, 
            markedForReview: newMarkedStatus,
            markedForReviewAt: newMarkedStatus ? now : undefined,
            updatedAt: now 
          }
        : t
    );
    setCommunicationThreads(updatedThreads);

    // Update localStorage
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      if (threadsStr) {
        const allThreads = JSON.parse(threadsStr);
        const updatedAllThreads = allThreads.map((t: any) =>
          t.id === selectedThreadId
            ? { 
                ...t, 
                markedForReview: newMarkedStatus,
                markedForReviewAt: newMarkedStatus ? now : undefined,
                updatedAt: now 
              }
            : t
        );
        localStorage.setItem('communication_threads', JSON.stringify(updatedAllThreads));
      }
    } catch (error) {
      console.error('Error updating thread in localStorage:', error);
    }

    // Add to timeline with specific action
    if (newMarkedStatus) {
      addActivity(
        id || '',
        ActivityActions.COMMUNICATION_THREAD_MARKED_FOR_REVIEW,
        `Agent requested staff review for "${thread.subject}"`,
        'agent-1',
        application.agentName || 'Agent',
        Role.AGENT,
        {
          threadId: selectedThreadId,
          threadSubject: thread.subject,
          issueType: thread.issueType,
        }
      );
    } else {
      addActivity(
        id || '',
        ActivityActions.COMMUNICATION_THREAD_REVIEW_REMOVED,
        `Agent removed review request for "${thread.subject}"`,
        'agent-1',
        application.agentName || 'Agent',
        Role.AGENT,
        {
          threadId: selectedThreadId,
          threadSubject: thread.subject,
        }
      );
    }

    toast.success(newMarkedStatus ? 'Thread marked for staff review' : 'Review mark removed');
    setSelectedThreadId(null);
  };

  const handleSignAsAgent = () => {
    const newAgentSigned = !agentSigned;
    setAgentSigned(newAgentSigned);

    // Update application
    const updatedApplication = {
      ...application,
      agentSigned: newAgentSigned
    };
    setApplication(updatedApplication);

    // Save to localStorage
    try {
      const submittedAppsStr = localStorage.getItem('submitted_applications');
      if (submittedAppsStr) {
        const submittedApps = JSON.parse(submittedAppsStr);
        const appIndex = submittedApps.findIndex((app: any) => app.id === id);
        if (appIndex !== -1) {
          submittedApps[appIndex] = updatedApplication;
          localStorage.setItem('submitted_applications', JSON.stringify(submittedApps));
        }
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Log activity
    addActivity(
      id || '',
      ActivityActions.DOCUMENT_SIGNED,
      newAgentSigned ? 'Agent signed the offer letter' : 'Agent unsigned the offer letter',
      'agent-1',
      application.agentName || 'Agent',
      Role.AGENT,
      { signatureType: 'agent' }
    );

    toast.success(newAgentSigned ? 'Signed as agent successfully!' : 'Agent signature removed');
  };

  const handleSignOnBehalfOfStudent = () => {
    const newStudentSigned = !studentSigned;
    setStudentSigned(newStudentSigned);

    // Update application
    const updatedApplication = {
      ...application,
      studentSigned: newStudentSigned
    };
    setApplication(updatedApplication);

    // Save to localStorage
    try {
      const submittedAppsStr = localStorage.getItem('submitted_applications');
      if (submittedAppsStr) {
        const submittedApps = JSON.parse(submittedAppsStr);
        const appIndex = submittedApps.findIndex((app: any) => app.id === id);
        if (appIndex !== -1) {
          submittedApps[appIndex] = updatedApplication;
          localStorage.setItem('submitted_applications', JSON.stringify(submittedApps));
        }
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Log activity
    addActivity(
      id || '',
      ActivityActions.DOCUMENT_SIGNED,
      newStudentSigned ? 'Agent signed on behalf of student' : 'Student signature (via agent) removed',
      'agent-1',
      application.agentName || 'Agent',
      Role.AGENT,
      { signatureType: 'student_via_agent' }
    );

    toast.success(newStudentSigned ? 'Signed on behalf of student successfully!' : 'Student signature removed');
  };

  const getStatusBadge = (status: CommunicationThreadStatus) => {
    switch (status) {
      case CommunicationThreadStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case CommunicationThreadStatus.UNDER_REVIEW:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case CommunicationThreadStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    }
  };

  const getIssueIcon = (issueType: string) => {
    return <FileText className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agent/applications')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl">{application.studentName}</h1>
            <p className="text-muted-foreground">
              Reference: {application.referenceNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={application.status} />
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Application Overview */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sign Offer Letter CTA - Shows when status is OFFER_SENT */}
          {application.status === ApplicationStatus.OFFER_SENT && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Offer Letter Received</CardTitle>
                </div>
                <CardDescription>
                  The offer letter is ready for signature. Please review and sign the document as agent and on behalf of the student.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!(agentSigned && studentSigned) && (
                  <Button 
                    onClick={() => setIsPDFDialogOpen(true)}
                    className="gap-2 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View & Sign Offer Letter
                  </Button>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {agentSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                    <span className={agentSigned ? 'text-green-700' : 'text-muted-foreground'}>
                      Agent signature {agentSigned ? 'completed' : 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {studentSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                    <span className={studentSigned ? 'text-green-700' : 'text-muted-foreground'}>
                      Student signature {studentSigned ? 'completed' : 'pending'}
                    </span>
                  </div>
                </div>
                {agentSigned && studentSigned && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-200 mt-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-900">
                        Both signatures completed! Staff will review the signed document.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Application Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Student Email</p>
                    <p className="text-sm truncate">{application.studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{application.studentPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="text-sm">{application.course}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm">{application.destination}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Intake</p>
                    <p className="text-sm">{application.intake}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <UserCheck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Assigned Staff</p>
                    <p className="text-sm">{application.assignedStaffName || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Current Stage</p>
                    <p className="text-sm capitalize">{application.currentStage?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs and Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="gs-documents">GS Documents</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Documents</CardTitle>
                  <CardDescription>All documents submitted with this application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Passport</p>
                          <p className="text-sm text-muted-foreground">
                            {application.passport?.passportNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">IELTS Certificate</p>
                          <p className="text-sm text-muted-foreground">
                            Overall: {application.englishTest?.overallScore}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Timeline</CardTitle>
                  <CardDescription>Activity history for this application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-0.5 flex-1 min-h-[40px] bg-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{activity.action ? activity.action.replace(/_/g, ' ') : 'Activity'}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {activity.performedByName}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.performedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gs-documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>GS Documents</CardTitle>
                  <CardDescription>Genuine Student assessment documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {gsDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {gsDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium capitalize">
                                {doc.category.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified && (
                              <Badge className="bg-green-500 text-white">Verified</Badge>
                            )}
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No GS documents uploaded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              {communicationThreads.length > 0 ? (
                <div className="relative">
                  {/* Threads List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication Threads</CardTitle>
                      <CardDescription>Click on a thread to view and respond</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {communicationThreads.map((thread) => {
                          const lastMessage = thread.messages[thread.messages.length - 1];
                          return (
                            <div
                              key={thread.id}
                              onClick={() => setSelectedThreadId(thread.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary hover:bg-accent/50 ${
                                selectedThreadId === thread.id ? 'border-primary bg-accent' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <div className="mt-0.5">{getIssueIcon(thread.issueType)}</div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <p className="font-medium text-sm truncate">{thread.subject}</p>
                                      {getStatusBadge(thread.status)}
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <p className="text-xs text-muted-foreground">
                                        {thread.issueType.replace(/_/g, ' ')} • {thread.targetSection.replace(/-/g, ' ')}
                                      </p>
                                      {thread.markedForReview && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs gap-1">
                                          <AlertCircle className="h-3 w-3" />
                                          Review Requested
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {lastMessage.sentByName}: {lastMessage.message}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(lastMessage.sentAt).split(',')[0]}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Sidebar - Chat Interface */}
                  {selectedThread && (
                    <div className="fixed right-0 top-0 h-screen w-full md:w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                      {/* Sidebar Header */}
                      <div className="border-b p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="mt-0.5">{getIssueIcon(selectedThread.issueType)}</div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold truncate">{selectedThread.subject}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedThread.issueType.replace(/_/g, ' ')} • {selectedThread.targetSection.replace(/-/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedThread.status)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedThreadId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedThread.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sentByRole === Role.AGENT ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg p-3 ${
                                message.sentByRole === Role.AGENT
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-baseline justify-between gap-3 mb-1">
                                <p className="text-xs font-medium opacity-90">{message.sentByName}</p>
                                <span className="text-xs opacity-70 whitespace-nowrap">
                                  {formatDate(message.sentAt).split(',')[1]}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Section */}
                      {selectedThread.status !== CommunicationThreadStatus.COMPLETED ? (
                        <div className="border-t p-4 space-y-3 bg-background">
                          <Textarea
                            placeholder="Type your reply..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/agent/applications/edit/${application.id}#${selectedThread.targetSection}`);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              Make Amends
                            </Button>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className={`gap-2 ${
                                  selectedThread.markedForReview 
                                    ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={handleMarkForReview}
                              >
                                {selectedThread.markedForReview ? (
                                  <>
                                    <X className="h-4 w-4" />
                                    Unmark Review
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark for Review
                                  </>
                                )}
                              </Button>
                              <Button size="sm" className="gap-2" onClick={handleSendMessage}>
                                <Send className="h-4 w-4" />
                                Send Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t p-4 bg-muted/50">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            This conversation has been marked as completed
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Communication History</CardTitle>
                    <CardDescription>Messages and correspondence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No communication threads yet
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* PDF Viewer & Signature Dialog */}
      <Dialog open={isPDFDialogOpen} onOpenChange={setIsPDFDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Offer Letter - Review & Sign</DialogTitle>
            <DialogDescription>
              Please review the offer letter carefully before signing
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {/* Mock PDF Viewer */}
            <div className="border rounded-lg p-8 bg-muted/30 min-h-[400px]">
              <div className="bg-white p-8 rounded shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Churchill University</h2>
                  <p className="text-muted-foreground">Offer Letter</p>
                </div>
                <div className="space-y-4 text-sm">
                  <p>Dear {application.studentName},</p>
                  <p>
                    We are pleased to offer you a place in the {application.course} program
                    at Churchill University for the {application.intake} intake.
                  </p>
                  <div className="my-4 p-4 bg-muted/50 rounded">
                    <p className="font-semibold mb-2">Program Details:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Course: {application.course}</li>
                      <li>Intake: {application.intake}</li>
                      <li>Duration: 2 years</li>
                      <li>Campus: {application.destination}</li>
                    </ul>
                  </div>
                  <p>
                    This offer is conditional upon meeting all entry requirements and submitting
                    required documentation before the program start date.
                  </p>
                  <p className="mt-6">
                    Yours sincerely,<br />
                    <span className="font-semibold">Churchill University Admissions Team</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex items-center space-x-2 flex-1">
                <Checkbox 
                  id="agentSignature" 
                  checked={agentSigned}
                  onCheckedChange={handleSignAsAgent}
                />
                <label
                  htmlFor="agentSignature"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Sign as Agent
                </label>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <Checkbox 
                  id="studentSignature" 
                  checked={studentSigned}
                  onCheckedChange={handleSignOnBehalfOfStudent}
                />
                <label
                  htmlFor="studentSignature"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Sign on behalf of Student
                </label>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsPDFDialogOpen(false)} className="flex-1 sm:flex-none">
                Close
              </Button>
              <Button 
                onClick={() => setIsPDFDialogOpen(false)}
                disabled={!agentSigned || !studentSigned}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Signing
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}