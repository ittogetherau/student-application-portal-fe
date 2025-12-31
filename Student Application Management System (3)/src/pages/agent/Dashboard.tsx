import { Link } from 'react-router-dom';
import { UserCheck, Clock, AlertTriangle, Calendar, Users, Search, ChevronDown, FileText, CheckCircle, Send, AlertCircle, TrendingUp, TrendingDown, Filter, Award, Mail, File, Building2, BookOpen, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { getRecentActivities } from '../../lib/activityLogger';

// Mock data for charts
const applicationsByStatusData = [
  { status: 'Draft', count: 12, fill: '#9CA3AF' },
  { status: 'Submitted', count: 28, fill: '#3B82F6' },
  { status: 'Under Review', count: 35, fill: '#8B5CF6' },
  { status: 'Offered', count: 42, fill: '#10B981' },
  { status: 'Accepted', count: 38, fill: '#059669' },
  { status: 'Rejected', count: 15, fill: '#EF4444' },
];

const monthlySubmissionData = [
  { month: 'Jan', Submitted: 12, 'Under Review': 8, Offered: 5, Accepted: 10 },
  { month: 'Feb', Submitted: 15, 'Under Review': 12, Offered: 8, Accepted: 6 },
  { month: 'Mar', Submitted: 18, 'Under Review': 10, Offered: 12, Accepted: 9 },
  { month: 'Apr', Submitted: 22, 'Under Review': 15, Offered: 18, Accepted: 11 },
  { month: 'May', Submitted: 25, 'Under Review': 18, Offered: 20, Accepted: 14 },
  { month: 'Jun', Submitted: 28, 'Under Review': 22, Offered: 16, Accepted: 19 },
  { month: 'Jul', Submitted: 30, 'Under Review': 20, Offered: 25, Accepted: 15 },
  { month: 'Aug', Submitted: 35, 'Under Review': 25, Offered: 22, Accepted: 20 },
  { month: 'Sep', Submitted: 40, 'Under Review': 30, Offered: 28, Accepted: 25 },
];

// Mock pending actions
const pendingActions = [
  {
    id: 1,
    type: 'Missing Transcript',
    refNumber: 'APP-2024-001',
    student: 'Michael Johnson',
    description: 'University transcript still not received for application verification',
    daysLeft: 3,
    priority: 'high',
  },
  {
    id: 2,
    type: 'Additional Information Required',
    refNumber: 'APP-2024-002',
    student: 'Sarah Anderson',
    description: 'Student needs to provide more details about...',
    daysLeft: 1,
    priority: 'high',
  },
  {
    id: 3,
    type: 'English Proficiency Test',
    refNumber: 'APP-2024-003',
    student: 'Emily Martinez',
    description: 'IELTS score still not submitted for application deadline',
    daysLeft: 1,
    priority: 'urgent',
  },
  {
    id: 4,
    type: 'Interview Scheduling',
    refNumber: 'APP-2024-004',
    student: 'David Martinez',
    description: 'Please schedule your interview today for well send during on school panel',
    daysLeft: 1,
    priority: 'urgent',
  },
];

// Mock recent activity
const recentActivities = [
  {
    id: 1,
    type: 'Offer Issued',
    title: 'Offer Issued',
    description: 'Offer letter sent with details to applying at Mohammed',
    time: '2 hours ago',
    icon: '📄',
    color: 'bg-green-500',
  },
  {
    id: 2,
    type: 'Application Submitted',
    title: 'Application Submitted',
    description: 'New student application for University of Sydney submitted',
    time: '5 hours ago',
    icon: '📋',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    type: 'New Message',
    title: 'New Message',
    description: 'New message from student about additional documents',
    time: '1 day ago',
    icon: '💬',
    color: 'bg-purple-500',
  },
  {
    id: 4,
    type: 'Document Uploaded',
    title: 'Document Uploaded',
    description: 'Student uploaded passport copy for UKVI University',
    time: '1 day ago',
    icon: '📎',
    color: 'bg-yellow-500',
  },
  {
    id: 5,
    type: 'Under Review',
    title: 'Under Review',
    description: 'Your application moved to audit review',
    time: '2 days ago',
    icon: '🔍',
    color: 'bg-orange-500',
  },
];

// Mock recent applications
const recentApplications = [
  {
    id: 'APP-2024-001',
    applicant: 'Sarah Chen',
    university: 'University of Toronto',
    program: 'Computer Science',
    intake: '2025-01-15',
    status: 'Offered',
  },
  {
    id: 'APP-2024-002',
    applicant: 'Michael Johnson',
    university: 'McGill University',
    program: 'Business Administration',
    intake: '2025-01-15',
    status: 'Under Review',
  },
  {
    id: 'APP-2024-003',
    applicant: 'Emily Martinez',
    university: 'University of Sydney',
    program: 'Engineering',
    intake: '2024-02-01',
    status: 'Submitted',
  },
  {
    id: 'APP-2024-004',
    applicant: 'David Lee',
    university: 'Web University',
    program: 'Data Science',
    intake: '2025-02-01',
    status: 'Draft',
  },
  {
    id: 'APP-2024-005',
    applicant: 'Emma Wilson',
    university: 'University of Melbourne',
    program: 'Medicine',
    intake: '2025-01-15',
    status: 'Accepted',
  },
];

// Mock draft applications
const draftApplications = [
  {
    id: 'DRF-001',
    name: 'Emma Thompson',
    university: 'University of Melbourne',
    program: 'Master of Business Studies',
    progress: 75,
  },
  {
    id: 'DRF-002',
    name: 'James Wilson',
    university: 'Monash University',
    program: 'Bachelor of Computer Science',
    progress: 45,
  },
  {
    id: 'DRF-003',
    name: 'Sophia Chen',
    university: 'University of Sydney',
    program: 'Master of Data Science',
    progress: 90,
  },
  {
    id: 'DRF-004',
    name: 'Oliver Martinez',
    university: 'University of Queensland',
    program: 'Bachelor of Engineering (Civil)',
    progress: 60,
  },
  {
    id: 'DRF-005',
    name: 'Ava Singh',
    university: 'Macquarie University',
    program: 'Master of Public Health',
    progress: 30,
  },
];

export default function AgentDashboard() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Offer Issued':
        return <Award className="h-4 w-4" />;
      case 'Application Submitted':
        return <CheckCircle className="h-4 w-4" />;
      case 'New Message':
        return <Mail className="h-4 w-4" />;
      case 'Document Uploaded':
        return <File className="h-4 w-4" />;
      case 'Under Review':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Offered':
        return 'default';
      case 'Under Review':
        return 'secondary';
      case 'Submitted':
        return 'secondary';
      case 'Accepted':
        return 'default';
      case 'Draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Offered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (daysLeft: number) => {
    if (daysLeft <= 1) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>;
    } else if (daysLeft <= 3) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">{daysLeft} days</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{daysLeft} days</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Education Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Agent Portal
          </p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Application ID or Student"
            className="pl-10"
          />
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Submitted</p>
                <p className="text-3xl mb-1">170</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>12% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">In Progress</p>
                <p className="text-3xl mb-1">28</p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>5% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Offers Issued</p>
                <p className="text-3xl mb-1">42</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>18% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Requiring Action</p>
                <p className="text-3xl mb-1">4</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications by Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applications by Status</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={applicationsByStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10 }} 
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {applicationsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Submission Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Submission Trends</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              Last 9 Months
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySubmissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
                <Bar dataKey="Submitted" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Under Review" fill="#EF4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Offered" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Accepted" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Actions</CardTitle>
            <Badge className="bg-red-100 text-red-700 border-red-200">4 Items</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div key={action.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg mt-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{action.type}</p>
                          <Badge variant="outline" className="text-xs">
                            {action.refNumber}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {action.student} • {action.daysLeft} day{action.daysLeft > 1 ? 's' : ''} to respond
                        </p>
                      </div>
                    </div>
                    {getPriorityBadge(action.daysLeft)}
                  </div>
                  <p className="text-xs text-muted-foreground pl-2 py-2 border-l-4 border-blue-500 bg-blue-50/50 pr-4 ml-2 rounded-r">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 ${activity.color} rounded-lg text-white flex items-center justify-center h-8 w-8`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <div>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Link to="/agent/applications">
            <Button variant="link" className="text-blue-600">
              View All Applications →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">App ID / Student</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">University</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Program</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Intake</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {app.applicant.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{app.applicant}</p>
                            <p className="text-xs text-muted-foreground">{app.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{app.university}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{app.program}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-sm">{app.intake}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Draft Applications */}
      <div>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Draft Applications</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">5 applications in progress</span>
            <Button className="gap-2">
              + New Draft
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draftApplications.map((draft) => (
              <div key={draft.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-2.5 min-w-[180px]">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                        {draft.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{draft.name}</p>
                      <p className="text-xs text-muted-foreground">{draft.id}</p>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{draft.university}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{draft.program}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-32 flex-shrink-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{draft.progress}%</span>
                    </div>
                    <Progress value={draft.progress} className="h-1.5" />
                  </div>

                  {/* Actions */}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
}