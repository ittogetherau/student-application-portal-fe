import { Link } from 'react-router-dom';
import { UserCheck, Clock, AlertTriangle, Calendar, Users, Search, ChevronDown, UserCog, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { ApplicationStatus, Role, User } from '../../lib/types';
import { mockStaffMembers } from '../../lib/mockData';

// Mock data for Application Status Distribution
const applicationStatusData = [
  { status: 'Under Review', count: 340, fill: '#3B82F6' },
  { status: 'Pending Decision', count: 160, fill: '#F59E0B' },
  { status: 'Approved', count: 290, fill: '#10B981' },
  { status: 'Rejected', count: 85, fill: '#EF4444' },
  { status: 'Waitlisted', count: 45, fill: '#8B5CF6' },
  { status: 'Withdrawn', count: 30, fill: '#6B7280' },
];

// Mock data for Staff Workload by Status
const staffWorkloadData = [
  { 
    name: 'J. Smith',
    'Under Review': 15,
    'Pending Decision': 8,
    'Approved': 5,
    'Rejected': 2,
  },
  { 
    name: 'M. Jones',
    'Under Review': 12,
    'Pending Decision': 10,
    'Approved': 6,
    'Rejected': 3,
  },
  { 
    name: 'K. Brown',
    'Under Review': 10,
    'Pending Decision': 7,
    'Approved': 8,
    'Rejected': 2,
  },
  { 
    name: 'A. Davis',
    'Under Review': 13,
    'Pending Decision': 6,
    'Approved': 7,
    'Rejected': 1,
  },
  { 
    name: 'R. Wilson',
    'Under Review': 18,
    'Pending Decision': 9,
    'Approved': 6,
    'Rejected': 3,
  },
];

// Mock priority applications data
const priorityApplications = [
  {
    id: 'APP-2025-001234',
    studentName: 'Sarah Chen',
    program: 'Computer Science',
    intake: 'Fall 2025',
    agent: 'GlobalEdu Partners',
    status: 'Under Review',
    priority: 'High',
    daysInReview: 8,
    assignedTo: 'J. Smith',
  },
  {
    id: 'APP-2025-001235',
    studentName: 'Muhammed Al-Rahman',
    program: 'Business Admin',
    intake: 'Fall 2025',
    agent: 'International Gateway',
    status: 'Pending Decision',
    priority: 'High',
    daysInReview: 12,
    assignedTo: 'M. Jones',
  },
  {
    id: 'APP-2025-001236',
    studentName: 'Priya Patel',
    program: 'Engineering',
    intake: 'Spring 2025',
    agent: 'StudyAbroad Connect',
    status: 'Under Review',
    priority: 'Medium',
    daysInReview: 4,
    assignedTo: 'J. Smith',
  },
  {
    id: 'APP-2025-001237',
    studentName: 'Carlos Rodriguez',
    program: 'Medicine',
    intake: 'Fall 2025',
    agent: 'Elite Education',
    status: 'Under Review',
    priority: 'High',
    daysInReview: 9,
    assignedTo: 'K. Brown',
  },
  {
    id: 'APP-2025-001238',
    studentName: 'Yuki Tanaka',
    program: 'Arts & Design',
    intake: 'Summer 2025',
    agent: 'Future Leaders',
    status: 'Pending Decision',
    priority: 'Medium',
    daysInReview: 6,
    assignedTo: 'M. Jones',
  },
  {
    id: 'APP-2025-001239',
    studentName: 'Emma Johnson',
    program: 'Law',
    intake: 'Fall 2025',
    agent: 'Academic Bridge',
    status: 'Under Review',
    priority: 'Low',
    daysInReview: 3,
    assignedTo: 'J. Smith',
  },
  {
    id: 'APP-2025-001240',
    studentName: 'Dmitri Volkov',
    program: 'Computer Science',
    intake: 'Fall 2025',
    agent: 'GlobalEdu Partners',
    status: 'Pending Decision',
    priority: 'High',
    daysInReview: 11,
    assignedTo: 'K. Brown',
  },
  {
    id: 'APP-2025-001241',
    studentName: 'Aisha Okonkwo',
    program: 'Business Admin',
    intake: 'Spring 2025',
    agent: 'International Gateway',
    status: 'Under Review',
    priority: 'Medium',
    daysInReview: 5,
    assignedTo: 'M. Jones',
  },
];

export default function StaffDashboard() {
  // Load applications from localStorage and count assignments
  const [staffAssignments, setStaffAssignments] = useState<{ [key: string]: number }>({});
  const [totalApplications, setTotalApplications] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [unassignedApplications, setUnassignedApplications] = useState<any[]>([]);

  // Get current logged-in user
  const getCurrentUser = (): User | null => {
    try {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
    return null;
  };

  // Helper to check if user is admin
  const isAdminUser = (user: User | null): boolean => {
    if (!user) return true; // Show all if no user logged in (for demo)
    return user.role === Role.SUPER_ADMIN || user.role === Role.STAFF_ADMIN;
  };

  const currentUser = getCurrentUser();
  const isAdmin = isAdminUser(currentUser);

  useEffect(() => {
    const loadStaffAssignments = () => {
      try {
        const submittedAppsStr = localStorage.getItem('submitted_applications');
        if (submittedAppsStr) {
          const applications = JSON.parse(submittedAppsStr);
          setTotalApplications(applications.length);
          
          // Count assignments per staff
          const assignments: { [key: string]: number } = {};
          const unassignedApps: any[] = [];
          
          applications.forEach((app: any) => {
            if (app.assignedStaffId) {
              assignments[app.assignedStaffId] = (assignments[app.assignedStaffId] || 0) + 1;
            } else {
              unassignedApps.push(app);
            }
          });
          
          setStaffAssignments(assignments);
          setUnassignedCount(unassignedApps.length);
          setUnassignedApplications(unassignedApps);
        } else {
          setTotalApplications(0);
          setUnassignedCount(0);
          setUnassignedApplications([]);
        }
      } catch (error) {
        console.error('Error loading staff assignments:', error);
      }
    };
    
    loadStaffAssignments();
    
    // Reload when storage changes (e.g., when assignments are made)
    const handleStorageChange = () => {
      loadStaffAssignments();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Under Review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending Decision':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">University Admissions Portal</h1>
          <p className="text-muted-foreground">
            Application Management Dashboard
          </p>
        </div>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Application ID or Student Name..."
            className="pl-10"
          />
        </div>
      </div>

      {/* My Workload Section */}
      <div>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Assigned to Me */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Assigned to Me</p>
                  </div>
                  <p className="text-4xl mb-1">34</p>
                  <p className="text-xs text-muted-foreground">Target: 40 per week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unassigned */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  </div>
                  <p className="text-4xl mb-1">127</p>
                  <p className="text-xs text-muted-foreground">Awaiting assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Overdue (&gt;5 days)</p>
                  </div>
                  <p className="text-4xl mb-1">8</p>
                  <p className="text-xs text-muted-foreground">Requires immediate action</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Overview Section */}
      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Staff Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Staff Overview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Application assignments per staff member
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl">{mockStaffMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Staff</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStaffMembers.map((staff) => {
                  const assignedCount = staffAssignments[staff.id] || 0;
                  return (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.email || staff.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1.5">
                          <Users className="h-3 w-3" />
                          {assignedCount}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary Footer */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Applications</span>
                  <span className="font-medium">{totalApplications}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Unassigned Applications List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Unassigned Applications
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Applications awaiting staff assignment
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl">{unassignedCount}</p>
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {unassignedApplications.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {unassignedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50/30 hover:bg-yellow-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{app.studentName}</p>
                          <Badge variant="outline" className="text-xs">
                            {app.referenceNumber}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{app.course || 'N/A'}</span>
                          <span>•</span>
                          <span>{app.intake || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Agent: {app.agentName || 'N/A'}
                        </p>
                      </div>
                      <div className="ml-3">
                        <Link to={`/staff/review/${app.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-green-50 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">All applications are assigned!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No unassigned applications at the moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Application Status Distribution</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              All Time
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={applicationStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-xs text-muted-foreground">■ Applications</p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Workload by Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Staff Workload by Status</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Applications assigned to each staff member</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" />
                All Time
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <Users className="h-4 w-4" />
                All Staff
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={staffWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Under Review" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending Decision" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Priority Applications Table */}
      <div>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Priority Applications</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1 h-9">
              All Status
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1 h-9">
              All Intakes
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button size="sm" className="h-9">
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Application ID</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Student Name</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Program</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Intake</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Agent</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Days in Review</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {priorityApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/staff/review/${app.id}`} className="text-sm text-blue-600 hover:underline">
                          {app.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{app.studentName}</td>
                      <td className="px-4 py-3 text-sm">{app.program}</td>
                      <td className="px-4 py-3 text-sm">{app.intake}</td>
                      <td className="px-4 py-3 text-sm">{app.agent}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getPriorityColor(app.priority)}>
                          {app.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${app.daysInReview > 7 ? 'text-red-600' : ''}`}>
                          {app.daysInReview} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{app.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 8 of 8 applications
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Last updated: December 25, 2025 at 2:30 PM • Refresh every 5 minutes
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
}