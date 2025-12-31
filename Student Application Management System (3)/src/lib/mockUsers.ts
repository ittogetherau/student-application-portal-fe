import { User, Role } from './types';

export const mockUsers: User[] = [
  // Super Admin
  {
    id: 'staff-1',
    email: 'admin@churchill.edu',
    name: 'Sarah Mitchell',
    role: Role.SUPER_ADMIN,
    staffId: 'STAFF001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  
  // Staff Admins
  {
    id: 'staff-2',
    email: 'james.wilson@churchill.edu',
    name: 'James Wilson',
    role: Role.STAFF_ADMIN,
    staffId: 'STAFF002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'staff-3',
    email: 'emily.chen@churchill.edu',
    name: 'Emily Chen',
    role: Role.STAFF_ADMIN,
    staffId: 'STAFF003',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  
  // Staff Reviewers
  {
    id: 'staff-4',
    email: 'michael.brown@churchill.edu',
    name: 'Michael Brown',
    role: Role.STAFF_REVIEWER,
    staffId: 'STAFF004',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'staff-5',
    email: 'lisa.anderson@churchill.edu',
    name: 'Lisa Anderson',
    role: Role.STAFF_REVIEWER,
    staffId: 'STAFF005',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'staff-6',
    email: 'david.kumar@churchill.edu',
    name: 'David Kumar',
    role: Role.STAFF_REVIEWER,
    staffId: 'STAFF006',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'staff-7',
    email: 'rachel.thompson@churchill.edu',
    name: 'Rachel Thompson',
    role: Role.STAFF_REVIEWER,
    staffId: 'STAFF007',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  
  // Agents
  {
    id: 'agent-1',
    email: 'john.smith@eduagent.com',
    name: 'John Smith',
    role: Role.AGENT,
    agentId: 'AGENT001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent-2',
    email: 'maria.garcia@studyabroad.com',
    name: 'Maria Garcia',
    role: Role.AGENT,
    agentId: 'AGENT002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent-3',
    email: 'robert.johnson@globalstudent.com',
    name: 'Robert Johnson',
    role: Role.AGENT,
    agentId: 'AGENT003',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent-4',
    email: 'priya.sharma@educonsult.com',
    name: 'Priya Sharma',
    role: Role.AGENT,
    agentId: 'AGENT004',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent-5',
    email: 'alex.wong@studentconnect.com',
    name: 'Alex Wong',
    role: Role.AGENT,
    agentId: 'AGENT005',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

export const getStaffUsers = (): User[] => {
  // Show Sarah Mitchell (Super Admin), David Kumar (Staff Reviewer), and Michael Brown (Staff Reviewer)
  return mockUsers.filter(user => 
    user.id === 'staff-1' || // Sarah Mitchell - Super Admin
    user.id === 'staff-4' || // Michael Brown - Staff Reviewer
    user.id === 'staff-6'    // David Kumar - Staff Reviewer
  );
};

export const getAgentUsers = (): User[] => {
  // Show John Smith, Maria Garcia, and Robert Johnson
  return mockUsers.filter(user => 
    user.id === 'agent-1' || // John Smith
    user.id === 'agent-2' || // Maria Garcia
    user.id === 'agent-3'    // Robert Johnson
  );
};

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return 'Super Admin';
    case Role.STAFF_ADMIN:
      return 'Staff Admin';
    case Role.STAFF_REVIEWER:
      return 'Staff Reviewer';
    case Role.AGENT:
      return 'Agent';
    case Role.STUDENT:
      return 'Student';
    default:
      return role;
  }
};

export const isStaffRole = (role: Role): boolean => {
  return role === Role.SUPER_ADMIN || role === Role.STAFF_ADMIN || role === Role.STAFF_REVIEWER;
};

export const isAdminRole = (role: Role): boolean => {
  return role === Role.SUPER_ADMIN || role === Role.STAFF_ADMIN;
};