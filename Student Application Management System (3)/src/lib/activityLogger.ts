import { Activity, Role } from './types';

const ACTIVITIES_STORAGE_KEY = 'application_activities';

// Get current user from localStorage (simplified - in real app use auth context)
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Default fallback
  return {
    id: 'user-1',
    name: 'Current User',
    role: Role.AGENT
  };
};

// Get all activities from localStorage
export const getAllActivities = (): Activity[] => {
  try {
    const activitiesStr = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (activitiesStr) {
      return JSON.parse(activitiesStr);
    }
  } catch (error) {
    console.error('Error loading activities:', error);
  }
  return [];
};

// Get activities for a specific application
export const getActivitiesByApplicationId = (applicationId: string): Activity[] => {
  const allActivities = getAllActivities();
  return allActivities
    .filter(activity => activity.applicationId === applicationId)
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
};

// Save activities to localStorage
const saveActivities = (activities: Activity[]): void => {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving activities:', error);
  }
};

// Add a new activity
export const addActivity = (
  applicationId: string,
  action: string,
  description: string,
  performedBy?: string,
  performedByName?: string,
  performedByRole?: Role,
  metadata?: any
): Activity => {
  const currentUser = getCurrentUser();
  
  const newActivity: Activity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    applicationId,
    action,
    description,
    performedBy: performedBy || currentUser.id,
    performedByName: performedByName || currentUser.name,
    performedByRole: performedByRole || currentUser.role,
    performedAt: new Date().toISOString(),
    metadata: metadata || {}
  };

  const allActivities = getAllActivities();
  allActivities.push(newActivity);
  saveActivities(allActivities);

  return newActivity;
};

// Add multiple activities at once (for batch operations)
export const addActivities = (activities: Omit<Activity, 'id' | 'performedAt'>[]): Activity[] => {
  const currentUser = getCurrentUser();
  
  const newActivities: Activity[] = activities.map(activity => ({
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    performedBy: activity.performedBy || currentUser.id,
    performedByName: activity.performedByName || currentUser.name,
    performedByRole: activity.performedByRole || currentUser.role,
    performedAt: new Date().toISOString(),
  }));

  const allActivities = getAllActivities();
  allActivities.push(...newActivities);
  saveActivities(allActivities);

  return newActivities;
};

// Get recent activities across all applications (for dashboards)
export const getRecentActivities = (limit: number = 10): Activity[] => {
  const allActivities = getAllActivities();
  return allActivities
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, limit);
};

// Clear all activities (for testing/reset)
export const clearAllActivities = (): void => {
  localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
};

// Initialize dummy timeline data for an application if it doesn't exist
export const initializeDummyTimeline = (applicationId: string, application: any): void => {
  const existingActivities = getActivitiesByApplicationId(applicationId);
  
  // Only initialize if no activities exist for this application
  if (existingActivities.length > 0) {
    return;
  }

  // Create realistic timeline entries with dates in the past
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const dummyActivities: Omit<Activity, 'id'>[] = [
    {
      applicationId,
      action: ActivityActions.APPLICATION_CREATED,
      description: `Application created by ${application.agentName || 'Agent'}`,
      performedBy: application.agentId || 'agent-1',
      performedByName: application.agentName || 'Agent',
      performedByRole: Role.AGENT,
      performedAt: daysAgo(7),
      metadata: {}
    },
    {
      applicationId,
      action: ActivityActions.DOCUMENT_UPLOADED,
      description: 'Passport document uploaded',
      performedBy: application.agentId || 'agent-1',
      performedByName: application.agentName || 'Agent',
      performedByRole: Role.AGENT,
      performedAt: daysAgo(6),
      metadata: { documentType: 'passport' }
    },
    {
      applicationId,
      action: ActivityActions.DOCUMENT_UPLOADED,
      description: 'Academic transcripts uploaded',
      performedBy: application.agentId || 'agent-1',
      performedByName: application.agentName || 'Agent',
      performedByRole: Role.AGENT,
      performedAt: daysAgo(6),
      metadata: { documentType: 'academic' }
    },
    {
      applicationId,
      action: ActivityActions.DOCUMENT_UPLOADED,
      description: 'English test results uploaded',
      performedBy: application.agentId || 'agent-1',
      performedByName: application.agentName || 'Agent',
      performedByRole: Role.AGENT,
      performedAt: daysAgo(5),
      metadata: { documentType: 'english_test' }
    },
    {
      applicationId,
      action: ActivityActions.APPLICATION_SUBMITTED,
      description: `Application submitted by ${application.agentName || 'Agent'} for ${application.studentName}`,
      performedBy: application.agentId || 'agent-1',
      performedByName: application.agentName || 'Agent',
      performedByRole: Role.AGENT,
      performedAt: daysAgo(5),
      metadata: {
        studentName: application.studentName,
        course: application.course,
        referenceNumber: application.referenceNumber
      }
    }
  ];

  // Add assignment activity if the application is assigned
  if (application.assignedStaffId) {
    const assignedStaff = application.assignedStaffName || 'Staff Member';
    dummyActivities.push({
      applicationId,
      action: ActivityActions.ASSIGNED_TO_STAFF,
      description: `Application assigned to ${assignedStaff}`,
      performedBy: 'staff-1',
      performedByName: 'Admin',
      performedByRole: Role.STAFF_ADMIN,
      performedAt: daysAgo(4),
      metadata: {
        staffId: application.assignedStaffId,
        staffName: assignedStaff
      }
    });
  }

  // Save all dummy activities
  const allActivities = getAllActivities();
  const activitiesWithIds: Activity[] = dummyActivities.map((activity, index) => ({
    ...activity,
    id: `act-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
  }));
  
  allActivities.push(...activitiesWithIds);
  saveActivities(allActivities);
};

// Activity action types (for consistency)
export const ActivityActions = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_CREATED: 'APPLICATION_CREATED',
  ASSIGNED_TO_STAFF: 'ASSIGNED_TO_STAFF',
  REVIEW_STARTED: 'REVIEW_STARTED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  STAGE_CHANGED: 'STAGE_CHANGED',
  OFFER_LETTER_SENT: 'OFFER_LETTER_SENT',
  OFFER_LETTER_VIEWED: 'OFFER_LETTER_VIEWED',
  OFFER_LETTER_SIGNED: 'OFFER_LETTER_SIGNED',
  OFFER_LETTER_DECLINED: 'OFFER_LETTER_DECLINED',
  DOCUMENT_REQUESTED: 'DOCUMENT_REQUESTED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  DOCUMENT_SIGNED: 'DOCUMENT_SIGNED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED: 'INTERVIEW_COMPLETED',
  GS_APPROVED: 'GS_APPROVED',
  GS_REJECTED: 'GS_REJECTED',
  GS_DOCUMENTS_REQUESTED: 'GS_DOCUMENTS_REQUESTED',
  GS_DOCUMENTS_UPLOADED: 'GS_DOCUMENTS_UPLOADED',
  FEE_PAYMENT_RECEIVED: 'FEE_PAYMENT_RECEIVED',
  COE_ISSUED: 'COE_ISSUED',
  COE_SENT: 'COE_SENT',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',
  COMMUNICATION_THREAD_CREATED: 'COMMUNICATION_THREAD_CREATED',
  COMMUNICATION_THREAD_RESOLVED: 'COMMUNICATION_THREAD_RESOLVED',
  COMMUNICATION_THREAD_REOPENED: 'COMMUNICATION_THREAD_REOPENED',
  COMMUNICATION_THREAD_MARKED_FOR_REVIEW: 'COMMUNICATION_THREAD_MARKED_FOR_REVIEW',
  COMMUNICATION_THREAD_REVIEW_REMOVED: 'COMMUNICATION_THREAD_REVIEW_REMOVED',
  COMMUNICATION_THREAD_PRIORITY_CHANGED: 'COMMUNICATION_THREAD_PRIORITY_CHANGED',
  SYNCED_TO_GALAXY: 'SYNCED_TO_GALAXY',
};