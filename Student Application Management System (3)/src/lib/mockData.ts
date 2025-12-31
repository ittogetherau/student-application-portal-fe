import {
  Application,
  ApplicationStatus,
  ApplicationStage,
  Role,
  Activity,
  Notification,
  NotificationType,
  Interview,
  GSDocument,
  GSDocumentCategory,
  CommunicationThread,
  CommunicationThreadStatus,
  CommunicationIssueType,
} from './types';
import { mockUsers as importedMockUsers, getStaffUsers } from './mockUsers';

// Mock Users - re-export from mockUsers.ts
export const mockUsers = importedMockUsers;

// Mock Staff Members (for assignment dropdown) - derived from mockUsers
export const mockStaffMembers = getStaffUsers().map(user => ({
  id: user.id, // Use user.id instead of staffId for consistency with current_user
  name: user.name,
  role: user.role,
  email: user.email,
  department: user.role === Role.SUPER_ADMIN ? 'Administration' :
              user.role === Role.STAFF_ADMIN ? 'Admissions' : 'Document Review',
}));

// Mock Applications
export const mockApplications: Application[] = [
  // Empty - applications will be created through the application form
];

// Mock Activities
export const mockActivities: Activity[] = [
  // Empty - activities will be generated when applications are created
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  // Empty - notifications will be generated based on application actions
];

// Mock Interviews
export const mockInterviews: Interview[] = [
  // Empty - interviews will be scheduled through the application workflow
];

// Mock GS Documents
export const mockGSDocuments: GSDocument[] = [
  // Empty - GS documents will be uploaded during the GS assessment stage
];

// Mock Communication Threads
export const mockCommunicationThreads: CommunicationThread[] = [
  // Empty - communication threads will be created when issues are raised
];

// Dashboard Metrics
export const mockAgentDashboardMetrics = {
  totalApplications: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  gsStage: 0,
  coeIssued: 0,
};

export const mockStaffDashboardMetrics = {
  assignedApplications: 0,
  pendingReviews: 0,
  interviewsScheduled: 0,
  tasksToday: 0,
  avgProcessingTime: 0, // days
};