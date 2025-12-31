import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command';
import {
  Download,
  Eye,
  FileText,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  ArrowLeft,
  Plus,
  Send,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  Users,
  ChevronsUpDown,
  Check,
  Upload,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { mockApplications, mockGSDocuments, mockCommunicationThreads, mockStaffMembers } from '../../lib/mockData';
import { ApplicationStatus, CommunicationThreadStatus, CommunicationIssueType, Role, User as UserType } from '../../lib/types';
import { ApplicationStatusBadge } from '../../components/shared/ApplicationStatusBadge';
import { toast } from 'sonner';
import { getActivitiesByApplicationId, addActivity, ActivityActions, initializeDummyTimeline } from '../../lib/activityLogger';
import { isAdminRole } from '../../lib/mockUsers';
import { getTaskByApplicationId, startTask, createTask } from '../../lib/taskManager';

// Status configuration for converting ApplicationStatus to readable labels
const staffStatusConfig: Record<ApplicationStatus, { label: string }> = {
  [ApplicationStatus.DRAFT]: { label: 'Draft' },
  [ApplicationStatus.SUBMITTED]: { label: 'Application Received' },
  [ApplicationStatus.UNDER_REVIEW]: { label: 'Application Under Review' },
  [ApplicationStatus.OFFER_SENT]: { label: 'Offer Sent' },
  [ApplicationStatus.OFFER_ACCEPTED]: { label: 'Offer Accepted' },
  [ApplicationStatus.GS_DOCUMENTS_PENDING]: { label: 'GS Documents Pending' },
  [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: { label: 'GS In Progress' },
  [ApplicationStatus.GS_APPROVED]: { label: 'GS Approved / COE Issued' },
  [ApplicationStatus.FEE_PAYMENT_PENDING]: { label: 'Fee Payment Pending' },
  [ApplicationStatus.COE_ISSUED]: { label: 'GS Approved / COE Issued' },
  [ApplicationStatus.REJECTED]: { label: 'Rejected' },
  [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: { label: 'Further Documents Requested' },
};

export default function StaffApplicationReview() {
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
      navigate('/staff/applications');
    } else {
      // Initialize dummy timeline data if it doesn't exist
      initializeDummyTimeline(id || '', application);
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
    // Fallback to mock data
    return mockCommunicationThreads.filter(thread => thread.applicationId === id);
  });

  const [newMessage, setNewMessage] = useState('');
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [newThread, setNewThread] = useState({
    subject: '',
    issueType: CommunicationIssueType.DOCUMENT_UNCLEAR,
    targetSection: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    deadline: '',
  });
  const [isOfferLetterDialogOpen, setIsOfferLetterDialogOpen] = useState(false);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [currentApplicationStatus, setCurrentApplicationStatus] = useState(application?.status || ApplicationStatus.UNDER_REVIEW);
  const [openStaffCombobox, setOpenStaffCombobox] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [galaxySynced, setGalaxySynced] = useState(() => {
    // Load from application data
    return application?.galaxySynced || false;
  });
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(() => {
    // Load from application data
    return application?.lastSyncDate || null;
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Load current user
  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadUser();

    // Listen for user changes
    const handleUserChange = () => {
      loadUser();
    };

    window.addEventListener('userChanged', handleUserChange);
    window.addEventListener('focus', handleUserChange);

    return () => {
      window.removeEventListener('userChanged', handleUserChange);
      window.removeEventListener('focus', handleUserChange);
    };
  }, []);

  // Reload threads when they change in localStorage
  useEffect(() => {
    const handleThreadsChange = () => {
      try {
        const threadsStr = localStorage.getItem('communication_threads');
        if (threadsStr) {
          const allThreads = JSON.parse(threadsStr);
          const appThreads = allThreads.filter((thread: any) => thread.applicationId === id);
          setCommunicationThreads(appThreads);
        }
      } catch (error) {
        console.error('Error reloading threads:', error);
      }
    };

    window.addEventListener('storage', handleThreadsChange);
    window.addEventListener('focus', handleThreadsChange);

    return () => {
      window.removeEventListener('storage', handleThreadsChange);
      window.removeEventListener('focus', handleThreadsChange);
    };
  }, [id]);

  // Check if current user is admin
  const isAdmin = currentUser ? isAdminRole(currentUser.role) : false;

  const selectedThread = communicationThreads.find(t => t.id === selectedThreadId);

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

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">Urgent</Badge>;
      default:
        return null;
    }
  };

  const getIssueIcon = (issueType: string) => {
    return <FileText className="h-4 w-4 text-orange-600" />;
  };

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
        <Button onClick={() => navigate('/staff/queue')} className="mt-4">
          Back to Queue
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

  const handleCreateThread = () => {
    if (!newThread.subject || !newThread.targetSection || !newThread.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const threadId = `thread-${Date.now()}`;
    const now = new Date().toISOString();

    const thread = {
      id: threadId,
      applicationId: id || '',
      issueType: newThread.issueType,
      targetSection: newThread.targetSection,
      subject: newThread.subject,
      status: CommunicationThreadStatus.PENDING,
      priority: newThread.priority,
      deadline: newThread.deadline || undefined,
      createdBy: currentUser?.id || 'staff-1',
      createdByName: currentUser?.name || 'Staff Member',
      createdByRole: currentUser?.role || Role.STAFF_REVIEWER,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          threadId: threadId,
          message: newThread.message,
          sentBy: currentUser?.id || 'staff-1',
          sentByName: currentUser?.name || 'Staff Member',
          sentByRole: currentUser?.role || Role.STAFF_REVIEWER,
          sentAt: now,
        }
      ]
    };

    // Save to localStorage
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      const allThreads = threadsStr ? JSON.parse(threadsStr) : [];
      allThreads.push(thread);
      localStorage.setItem('communication_threads', JSON.stringify(allThreads));
      
      // Update local state
      setCommunicationThreads([...communicationThreads, thread]);
    } catch (error) {
      console.error('Error saving thread to localStorage:', error);
    }

    // Add to timeline
    const priorityText = newThread.priority ? ` (Priority: ${newThread.priority.toUpperCase()})` : '';
    const deadlineText = newThread.deadline ? ` | Deadline: ${new Date(newThread.deadline).toLocaleDateString()}` : '';
    
    addActivity(
      id || '',
      ActivityActions.COMMUNICATION_THREAD_CREATED,
      `Communication thread created: "${newThread.subject}"${priorityText}${deadlineText}`,
      currentUser?.id || 'staff-1',
      currentUser?.name || 'Staff Member',
      currentUser?.role || Role.STAFF_REVIEWER,
      {
        threadId: threadId,
        subject: newThread.subject,
        issueType: newThread.issueType,
        targetSection: newThread.targetSection,
        priority: newThread.priority,
        deadline: newThread.deadline,
      }
    );

    toast.success('Communication thread created successfully');
    setIsCreateThreadOpen(false);
    setNewThread({
      subject: '',
      issueType: CommunicationIssueType.DOCUMENT_UNCLEAR,
      targetSection: '',
      message: '',
      priority: 'medium',
      deadline: '',
    });
  };

  const handleChangeThreadStatus = (threadId: string, newStatus: CommunicationThreadStatus) => {
    // Update local state
    const updatedThreads = communicationThreads.map(thread =>
      thread.id === threadId
        ? { ...thread, status: newStatus, updatedAt: new Date().toISOString() }
        : thread
    );
    setCommunicationThreads(updatedThreads);

    // Update localStorage
    try {
      const threadsStr = localStorage.getItem('communication_threads');
      if (threadsStr) {
        const allThreads = JSON.parse(threadsStr);
        const updatedAllThreads = allThreads.map((thread: any) =>
          thread.id === threadId
            ? { ...thread, status: newStatus, updatedAt: new Date().toISOString() }
            : thread
        );
        localStorage.setItem('communication_threads', JSON.stringify(updatedAllThreads));
      }
    } catch (error) {
      console.error('Error updating thread status in localStorage:', error);
    }

    // Add to timeline with specific action
    const thread = communicationThreads.find(t => t.id === threadId);
    if (thread) {
      let action = '';
      let description = '';
      
      if (newStatus === CommunicationThreadStatus.COMPLETED) {
        action = ActivityActions.COMMUNICATION_THREAD_RESOLVED;
        description = `Staff resolved thread "${thread.subject}"`;
      } else if (newStatus === CommunicationThreadStatus.PENDING) {
        action = ActivityActions.COMMUNICATION_THREAD_REOPENED;
        description = `Staff reopened thread "${thread.subject}"`;
      } else {
        action = ActivityActions.COMMUNICATION_THREAD_UPDATED;
        description = `Thread "${thread.subject}" status changed to ${newStatus.replace(/_/g, ' ')}`;
      }

      addActivity(
        id || '',
        action,
        description,
        currentUser?.id || 'staff-1',
        currentUser?.name || 'Staff Member',
        currentUser?.role || Role.STAFF_REVIEWER,
        {
          threadId: threadId,
          threadSubject: thread.subject,
          oldStatus: thread.status,
          newStatus: newStatus,
        }
      );
    }

    toast.success(`Thread status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

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
      sentBy: currentUser?.id || 'staff-1',
      sentByName: currentUser?.name || 'Staff Member',
      sentByRole: currentUser?.role || Role.STAFF_REVIEWER,
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

  const handleToggleResolve = () => {
    if (!selectedThreadId) return;

    const thread = communicationThreads.find(t => t.id === selectedThreadId);
    if (!thread) return;

    const isCompleted = thread.status === CommunicationThreadStatus.COMPLETED;
    const newStatus = isCompleted ? CommunicationThreadStatus.PENDING : CommunicationThreadStatus.COMPLETED;

    // Update local state
    const updatedThreads = communicationThreads.map(t =>
      t.id === selectedThreadId
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
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
            ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
            : t
        );
        localStorage.setItem('communication_threads', JSON.stringify(updatedAllThreads));
      }
    } catch (error) {
      console.error('Error updating thread in localStorage:', error);
    }

    // Add to timeline
    addActivity(
      id || '',
      ActivityActions.COMMUNICATION_THREAD_UPDATED,
      `Thread "${thread.subject}" ${isCompleted ? 'reopened' : 'marked as resolved'}`,
      currentUser?.id || 'staff-1',
      currentUser?.name || 'Staff Member',
      currentUser?.role || Role.STAFF_REVIEWER,
      {
        threadId: selectedThreadId,
        oldStatus: thread.status,
        newStatus: newStatus,
      }
    );

    toast.success(`Thread ${isCompleted ? 'reopened' : 'marked as resolved'} successfully`);
  };

  const handleAssignStaff = (staffId: string) => {
    // Update application state
    const updatedApplication = {
      ...application,
      assignedStaffId: staffId === 'unassigned' ? undefined : staffId
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

    const staff = mockStaffMembers.find(s => s.id === staffId);
    if (staff) {
      // Create a task for the assigned staff member
      createTask(
        id || '',
        application.referenceNumber,
        application.studentName,
        application.course || 'N/A',
        staff.id,
        staff.name
      );

      // Log activity with current user's information
      addActivity(
        id || '',
        ActivityActions.ASSIGNED_TO_STAFF,
        `Application assigned to ${staff.name} (${staff.department})`,
        currentUser?.id || 'staff-1',
        currentUser?.name || 'Current Staff',
        currentUser?.role || Role.STAFF_ADMIN,
        {
          staffId: staff.id,
          staffName: staff.name,
          department: staff.department
        }
      );
      toast.success(`Application assigned to ${staff.name}`);
    } else if (staffId === 'unassigned') {
      // Log unassignment
      addActivity(
        id || '',
        ActivityActions.ASSIGNED_TO_STAFF,
        'Application unassigned',
        currentUser?.id || 'staff-1',
        currentUser?.name || 'Current Staff',
        currentUser?.role || Role.STAFF_ADMIN
      );
      toast.success('Application unassigned');
    }
  };

  const handleStartReview = () => {
    if (!application || !currentUser) return;

    // Update application status to UNDER_REVIEW
    const updatedApplication = {
      ...application,
      status: ApplicationStatus.UNDER_REVIEW
    };
    setApplication(updatedApplication);
    setCurrentApplicationStatus(ApplicationStatus.UNDER_REVIEW);

    // Update in localStorage
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

    // Check if task exists, if not create it
    const existingTask = getTaskByApplicationId(id || '');
    if (!existingTask) {
      // Create task if it doesn't exist
      createTask(
        id || '',
        application.referenceNumber,
        application.studentName,
        application.course || 'N/A',
        currentUser.id,
        currentUser.name
      );
    }

    // Start the task
    startTask(id || '');

    // Log activity with REVIEW_STARTED action
    addActivity(
      id || '',
      ActivityActions.REVIEW_STARTED,
      `Application review started by ${currentUser.name}`,
      currentUser.id,
      currentUser.name,
      currentUser.role
    );

    toast.success('Application review started!', {
      description: 'The application is now under review and appears in your tasks.'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setOfferLetterFile(file);
    }
  };

  const handleSendOfferLetter = () => {
    if (!offerLetterFile) {
      toast.error('Please upload an offer letter PDF');
      return;
    }

    // Simulate sending offer letter
    setTimeout(() => {
      handleStatusChange(ApplicationStatus.OFFER_SENT);
      
      toast.success('Offer letter sent successfully!', {
        description: 'The offer letter has been sent to the agent and student for signatures.',
      });
      setIsOfferLetterDialogOpen(false);
      setOfferLetterFile(null);
    }, 1000);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (!application || !currentUser) return;

    const previousStatus = application.status;
    const previousStatusLabel = staffStatusConfig[previousStatus]?.label || previousStatus;
    const newStatusLabel = staffStatusConfig[newStatus]?.label || newStatus;

    // Update application status
    const updatedApplication = {
      ...application,
      status: newStatus
    };
    setApplication(updatedApplication);
    setCurrentApplicationStatus(newStatus);

    // Update in localStorage
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

    // Log activity to timeline
    addActivity(
      id || '',
      ActivityActions.STATUS_CHANGED,
      `Status changed from "${previousStatusLabel}" to "${newStatusLabel}"`,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      {
        previousStatus,
        newStatus,
        previousStatusLabel,
        newStatusLabel
      }
    );

    toast.success('Status updated successfully!', {
      description: `Application status changed to "${newStatusLabel}"`
    });
  };

  const handleSyncToGalaxy = () => {
    if (!application || !currentUser) return;

    setIsSyncing(true);

    // Simulate API call to Galaxy student management system
    setTimeout(() => {
      const syncDate = new Date().toISOString();
      setGalaxySynced(true);
      setLastSyncDate(syncDate);
      setIsSyncing(false);

      // Update application with sync data
      const updatedApplication = {
        ...application,
        galaxySynced: true,
        lastSyncDate: syncDate
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

      // Log activity to timeline
      addActivity(
        id || '',
        ActivityActions.SYNCED_TO_GALAXY,
        `Application data synced to Galaxy student management system by ${currentUser.name}`,
        currentUser.id,
        currentUser.name,
        currentUser.role,
        {
          syncDate,
          systemName: 'Galaxy'
        }
      );

      toast.success('Synced to Galaxy successfully!', {
        description: 'Application data has been synchronized with Galaxy student management system.'
      });
    }, 2000); // Simulate 2 second delay
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/staff/queue')}>
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
          <ApplicationStatusBadge 
            status={application.status} 
            portal="staff"
            editable={true}
            onStatusChange={handleStatusChange}
          />
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - CTA Cards + Application Overview */}
        <div className="lg:col-span-1 space-y-4">
          {/* Action Cards */}
          {/* Start Review Action - Shows when application is not started - Both assignee and admin can start */}
          {(application.assignedStaffId === currentUser?.id || isAdminRole(currentUser?.role)) && 
           application.status !== ApplicationStatus.UNDER_REVIEW && 
           application.status !== ApplicationStatus.OFFER_SENT &&
           application.status !== ApplicationStatus.GS_DOCUMENTS_PENDING &&
           application.status !== ApplicationStatus.GS_INTERVIEW_SCHEDULED &&
           application.status !== ApplicationStatus.GS_APPROVED &&
           application.status !== ApplicationStatus.FEE_PAYMENT_PENDING &&
           application.status !== ApplicationStatus.COE_ISSUED && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Ready to Start Review?</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {application.assignedStaffId === currentUser?.id 
                    ? "This application has been assigned to you. Click the button below to start reviewing the application."
                    : "You can start reviewing this application. Click the button below to begin."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleStartReview} className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <PlayCircle className="h-4 w-4" />
                  Start Application Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Offer Letter Action - Shows when application is Under Review */}
          {currentApplicationStatus === ApplicationStatus.UNDER_REVIEW && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Ready to Send Offer Letter?</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {!galaxySynced 
                    ? "First, sync the application data to Galaxy student management system, then you can send the offer letter."
                    : "All documents have been reviewed and synced to Galaxy. You can now upload and send the offer letter to the agent and student."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!galaxySynced ? (
                  <Button 
                    onClick={handleSyncToGalaxy} 
                    disabled={isSyncing}
                    className="gap-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync to Galaxy'}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Last synced: {lastSyncDate ? formatDate(lastSyncDate) : 'N/A'}</span>
                    </div>
                    <Dialog open={isOfferLetterDialogOpen} onOpenChange={setIsOfferLetterDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 w-full sm:w-auto">
                          <Send className="h-4 w-4" />
                          Send Offer Letter
                        </Button>
                      </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Offer Letter</DialogTitle>
                      <DialogDescription>
                        Upload the offer letter PDF. It will be sent to both the agent and student for signatures.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg bg-purple-50 p-3 border border-purple-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <a 
                            href="https://galaxy360.example.com/offer-letters" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-purple-700 hover:text-purple-900 underline font-medium"
                          >
                            Collect offer letter from Galaxy 360 →
                          </a>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="offerLetter">Offer Letter (PDF only)</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="offerLetter"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                          />
                          {offerLetterFile && (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        {offerLetterFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected file: {offerLetterFile.name}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">What happens next?</p>
                            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                              <li>The offer letter will be sent to the agent</li>
                              <li>The student will receive a copy to review and sign</li>
                              <li>Application status will change to "Offer Sent"</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOfferLetterDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendOfferLetter} disabled={!offerLetterFile}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Send
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Waiting for Signatures - Shows when offer has been sent but not fully signed */}
          {application.status === ApplicationStatus.OFFER_SENT && !(application.agentSigned && application.studentSigned) && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Waiting for Signatures</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  The offer letter has been sent successfully. We are now waiting for the agent and student to review and sign the document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Offer letter sent to agent</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Offer letter sent to student</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    {application.agentSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={application.agentSigned ? 'text-green-700' : 'text-muted-foreground'}>
                      {application.agentSigned ? 'Agent signed' : 'Awaiting agent signature'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    {application.studentSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={application.studentSigned ? 'text-green-700' : 'text-muted-foreground'}>
                      {application.studentSigned ? 'Student signed (via agent)' : 'Awaiting student signature'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start GS Process - Shows when offer is fully signed */}
          {application.status === ApplicationStatus.OFFER_SENT && application.agentSigned && application.studentSigned && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Offer Letter Signed!</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  Both the agent and student have signed the offer letter. Review the signed document and start the Genuine Student (GS) assessment process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-0.5">Signed Offer Letter</p>
                      <p className="text-xs text-green-700">offer-letter-{application.referenceNumber}.pdf</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-green-200 hover:bg-green-100">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    handleStatusChange(ApplicationStatus.GS_INTERVIEW_SCHEDULED);
                    toast.success('GS Process started!', {
                      description: 'The Genuine Student assessment process has been initiated.'
                    });
                  }}
                  className="gap-2 w-full bg-green-600 hover:bg-green-700"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start GS Process
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Application Overview */}
          <Card className="sticky top-6 pt-3">
            <CardContent>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Student Email</p>
                    <p className="text-sm truncate">{application.studentEmail || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{application.studentPhone || application.formData?.[2]?.mobileNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="text-sm">{application.course || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm">{application.destination || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Intake</p>
                    <p className="text-sm">{application.intake || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Agent</p>
                    <p className="text-sm">{application.agentName || 'N/A'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2.5">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1.5">Assigned To</p>
                    {!isAdmin && (
                      <div className="text-sm text-muted-foreground mb-1.5 bg-muted/50 p-2 rounded border">
                        {application.assignedStaffId ? (
                          (() => {
                            const staff = mockStaffMembers.find((s) => s.id === application.assignedStaffId);
                            return staff ? staff.name : "Unassigned";
                          })()
                        ) : (
                          "Unassigned"
                        )}
                      </div>
                    )}
                    {isAdmin && (
                      <Popover open={openStaffCombobox} onOpenChange={setOpenStaffCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openStaffCombobox}
                            className="w-full h-8 justify-between text-sm"
                          >
                            {application.assignedStaffId ? (
                              (() => {
                                const staff = mockStaffMembers.find((s) => s.id === application.assignedStaffId);
                                return staff ? staff.name : "Select staff member...";
                              })()
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search by name or email..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No staff member found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="unassigned"
                                  onSelect={() => {
                                    handleAssignStaff('unassigned');
                                    setOpenStaffCombobox(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${!application.assignedStaffId ? 'opacity-100' : 'opacity-0'}`}
                                  />
                                  <span className="text-muted-foreground">Unassigned</span>
                                </CommandItem>
                                {mockStaffMembers.map((staff) => (
                                  <CommandItem
                                    key={staff.id}
                                    value={`${staff.name} ${staff.email}`}
                                    onSelect={() => {
                                      handleAssignStaff(staff.id);
                                      setOpenStaffCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${application.assignedStaffId === staff.id ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    <div className="flex flex-col">
                                      <span>{staff.name}</span>
                                      <span className="text-xs text-muted-foreground">{staff.email || staff.department}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
                <Separator />
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
                    <p className="text-sm">{formatDate(application.updatedAt || application.lastUpdated || application.submittedAt)}</p>
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
          {/* Status Changed Success Message */}
          {currentApplicationStatus === ApplicationStatus.OFFER_SENT && application.status === ApplicationStatus.UNDER_REVIEW && (
            <Card className="mb-4 border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Offer Letter Sent Successfully!</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      The offer letter has been sent to the agent and student for signatures. Application status has been updated to "Offer Sent".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="gs-documents">GS Documents</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              {activeTab === 'communication' && (
                <Dialog open={isCreateThreadOpen} onOpenChange={setIsCreateThreadOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Thread
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Communication Thread</DialogTitle>
                      <DialogDescription>
                        Create a new communication thread to request changes or clarifications from the agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="E.g., Passport Document Quality Issue"
                          value={newThread.subject}
                          onChange={(e) => setNewThread({ ...newThread, subject: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type</Label>
                        <Select
                          value={newThread.issueType}
                          onValueChange={(value) => setNewThread({ ...newThread, issueType: value as CommunicationIssueType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CommunicationIssueType.DOCUMENT_UNCLEAR}>Document Unclear</SelectItem>
                            <SelectItem value={CommunicationIssueType.INFORMATION_INCORRECT}>Information Incorrect</SelectItem>
                            <SelectItem value={CommunicationIssueType.DOCUMENT_MISSING}>Document Missing</SelectItem>
                            <SelectItem value={CommunicationIssueType.INFORMATION_APPEARS_FAKE}>Information Appears Fake</SelectItem>
                            <SelectItem value={CommunicationIssueType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetSection">Target Section</Label>
                        <Select
                          value={newThread.targetSection}
                          onValueChange={(value) => setNewThread({ ...newThread, targetSection: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal-information">Personal Information</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="academic-documents">Academic Documents</SelectItem>
                            <SelectItem value="english-test">English Test</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newThread.priority}
                            onValueChange={(value) => setNewThread({ ...newThread, priority: value as 'low' | 'medium' | 'high' | 'urgent' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deadline">Deadline (Optional)</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newThread.deadline}
                            onChange={(e) => setNewThread({ ...newThread, deadline: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe the issue in detail..."
                          value={newThread.message}
                          onChange={(e) => setNewThread({ ...newThread, message: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateThreadOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateThread}>Create Thread</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

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
              {/* Communication Threads */}
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
                                      {thread.priority && getPriorityBadge(thread.priority)}
                                      {thread.deadline && (
                                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(thread.deadline).toLocaleDateString()}
                                        </Badge>
                                      )}
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
                    <div className="fixed right-0 top-0 h-screen w-full md:w-[500px] bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
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
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {selectedThread.priority && getPriorityBadge(selectedThread.priority)}
                                {selectedThread.deadline && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(selectedThread.deadline).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
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
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-primary text-primary-foreground'
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

                      {/* Staff Actions Section */}
                      <div className="border-t p-4 space-y-3 bg-background">
                        {/* Change Status */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Status:</Label>
                          <Select
                            value={selectedThread.status}
                            onValueChange={(value) => handleChangeThreadStatus(selectedThread.id, value as CommunicationThreadStatus)}
                          >
                            <SelectTrigger className="w-[180px] h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={CommunicationThreadStatus.PENDING}>Pending</SelectItem>
                              <SelectItem value={CommunicationThreadStatus.UNDER_REVIEW}>Under Review</SelectItem>
                              <SelectItem value={CommunicationThreadStatus.COMPLETED}>Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Reply Section */}
                        <Textarea
                          placeholder="Add a follow-up message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <Button 
                            size="sm" 
                            variant={selectedThread.status === CommunicationThreadStatus.COMPLETED ? "outline" : "default"}
                            className="gap-2"
                            onClick={handleToggleResolve}
                          >
                            {selectedThread.status === CommunicationThreadStatus.COMPLETED ? (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Reopen Thread
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Mark as Resolved
                              </>
                            )}
                          </Button>
                          <Button size="sm" className="gap-2" onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                            Send Message
                          </Button>
                        </div>
                      </div>
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
    </div>
  );
}