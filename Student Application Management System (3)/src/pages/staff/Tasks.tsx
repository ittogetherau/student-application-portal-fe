import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Send,
  Calendar,
  User,
  Filter,
  Search,
  MessageSquare,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { getTasksByStaffId, ReviewTask } from '../../lib/taskManager';
import { User as UserType } from '../../lib/types';

interface Task {
  id: string;
  applicationId: string;
  studentName: string;
  taskType: 'review' | 'amend' | 'interview' | 'offer' | 'message' | 'document';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
  threadCount: number;
  unreadCount: number;
}

interface Thread {
  id: string;
  taskId: string;
  sender: string;
  senderRole: 'agent' | 'staff' | 'student';
  message: string;
  timestamp: string;
  attachments?: string[];
}

// Mock data
const mockTasks: Task[] = [
  {
    id: 'T001',
    applicationId: 'APP2024001',
    studentName: 'John Smith',
    taskType: 'amend',
    title: 'Application Amendments Required',
    description: 'Agent has requested review after making amendments to passport details',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T09:30:00',
    dueDate: '2024-01-17T17:00:00',
    threadCount: 3,
    unreadCount: 1,
  },
  {
    id: 'T002',
    applicationId: 'APP2024015',
    studentName: 'Emma Wilson',
    taskType: 'document',
    title: 'Missing Document Upload',
    description: 'Passport copy uploaded by agent - needs verification',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T10:15:00',
    threadCount: 1,
    unreadCount: 0,
  },
  {
    id: 'T003',
    applicationId: 'APP2024008',
    studentName: 'Michael Chen',
    taskType: 'interview',
    title: 'Schedule GS Interview',
    description: 'Student requested interview reschedule due to time zone conflict',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T11:00:00',
    dueDate: '2024-01-16T17:00:00',
    threadCount: 5,
    unreadCount: 2,
  },
  {
    id: 'T004',
    applicationId: 'APP2024022',
    studentName: 'Sarah Thompson',
    taskType: 'review',
    title: 'Initial Application Review',
    description: 'New application submitted - pending initial review',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T13:45:00',
    threadCount: 0,
    unreadCount: 0,
  },
  {
    id: 'T005',
    applicationId: 'APP2024019',
    studentName: 'David Lee',
    taskType: 'message',
    title: 'Agent Query - Course Change',
    description: 'Agent asking about process for changing selected course',
    priority: 'low',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T14:20:00',
    threadCount: 2,
    unreadCount: 1,
  },
  {
    id: 'T006',
    applicationId: 'APP2024005',
    studentName: 'Lisa Anderson',
    taskType: 'offer',
    title: 'Offer Letter Follow-up',
    description: 'Student has questions about offer letter terms',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T15:00:00',
    threadCount: 4,
    unreadCount: 0,
  },
];

const mockThreads: Thread[] = [
  {
    id: 'TH001',
    taskId: 'T001',
    sender: 'ABC Education Agency',
    senderRole: 'agent',
    message: 'We have updated the passport details as requested. The passport number has been corrected and a new copy has been uploaded. Please review.',
    timestamp: '2024-01-15T09:30:00',
    attachments: ['passport_updated.pdf'],
  },
  {
    id: 'TH002',
    taskId: 'T001',
    sender: 'Sarah Johnson',
    senderRole: 'staff',
    message: 'Thank you. I will review the updated documents within 24 hours.',
    timestamp: '2024-01-15T09:45:00',
  },
  {
    id: 'TH003',
    taskId: 'T001',
    sender: 'ABC Education Agency',
    senderRole: 'agent',
    message: 'Just following up - has the review been completed?',
    timestamp: '2024-01-15T14:30:00',
  },
];

export default function StaffTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Load current user
  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadUser();

    window.addEventListener('userChanged', loadUser);
    window.addEventListener('focus', loadUser);

    return () => {
      window.removeEventListener('userChanged', loadUser);
      window.removeEventListener('focus', loadUser);
    };
  }, []);

  // Load tasks from localStorage and merge with mock tasks
  useEffect(() => {
    document.title = 'Tasks - Churchill University Staff Portal';
    
    if (!currentUser) return;

    const loadTasks = () => {
      // Get real tasks from localStorage
      const realTasks = getTasksByStaffId(currentUser.id);
      
      // Convert ReviewTask to Task format
      const convertedTasks: Task[] = realTasks.map((rt: ReviewTask) => ({
        id: rt.id,
        applicationId: rt.applicationId,
        studentName: rt.studentName,
        taskType: 'review' as const,
        title: rt.status === 'pending' ? 'Application Assigned - Ready to Review' : 
               rt.status === 'in_progress' ? 'Application Under Review' : 
               'Review Completed',
        description: `Review application for ${rt.studentName} - ${rt.course}`,
        priority: 'medium' as const,
        status: rt.status === 'pending' ? 'pending' : 
                rt.status === 'in_progress' ? 'in-progress' : 
                'completed',
        assignedTo: rt.assignedStaffName,
        createdAt: rt.createdAt,
        dueDate: undefined,
        threadCount: rt.threadIds?.length || 0,
        unreadCount: 0,
      }));

      // Merge with mock tasks (only show mock tasks for the current user)
      const mockTasksFiltered = mockTasks.filter(t => t.assignedTo === currentUser.name);
      const allTasks = [...convertedTasks, ...mockTasksFiltered];
      
      setTasks(allTasks);
      
      // Set first task as selected if none selected
      if (!selectedTask && allTasks.length > 0) {
        setSelectedTask(allTasks[0]);
      }
    };

    loadTasks();

    // Listen for task changes
    const handleStorageChange = () => {
      loadTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [currentUser]);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesType = filterType === 'all' || task.taskType === filterType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return <Eye className="h-4 w-4" />;
      case 'amend': return <FileEdit className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'document': return <FileEdit className="h-4 w-4" />;
      case 'offer': return <Send className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in-progress': return 'default';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // Load threads for this task
    const taskThreads = mockThreads.filter(t => t.taskId === task.id);
    setThreads(taskThreads);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTask) return;

    const newThread: Thread = {
      id: `TH${Date.now()}`,
      taskId: selectedTask.id,
      sender: 'Sarah Johnson',
      senderRole: 'staff',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setThreads([...threads, newThread]);
    setNewMessage('');
  };

  const handleViewApplication = () => {
    if (selectedTask) {
      navigate(`/staff/review/${selectedTask.applicationId}`);
    }
  };

  const handleMarkComplete = () => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, status: 'completed' as const }
          : t
      ));
      setSelectedTask({ ...selectedTask, status: 'completed' });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/30">
      {/* Left Sidebar - Task List */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="mb-4">My Tasks</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`mb-2 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedTask?.id === task.id ? 'border-primary bg-muted/50' : ''
                }`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="mt-0.5">{getTaskTypeIcon(task.taskType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{task.applicationId}</span>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm truncate mb-1">{task.studentName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.title}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(task.createdAt)}
                  </div>
                  {task.threadCount > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task.threadCount}
                      {task.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          {task.unreadCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} • {
              filteredTasks.filter(t => t.status === 'pending').length
            } pending
          </div>
        </div>
      </div>

      {/* Middle Section - Communication Threads */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Filters</span>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="amend">Amendment</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thread Display */}
        {selectedTask ? (
          <>
            <div className="p-4 border-b bg-background">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="mb-1">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
                <Badge variant={getStatusColor(selectedTask.status)}>
                  {selectedTask.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedTask.studentName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimestamp(selectedTask.createdAt)}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {threads.length > 0 ? (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`flex ${thread.senderRole === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${thread.senderRole === 'staff' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs opacity-70">{thread.sender}</span>
                          <span className="text-xs opacity-50">{formatTimestamp(thread.timestamp)}</span>
                        </div>
                        <p className="text-sm">{thread.message}</p>
                        {thread.attachments && thread.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-current/10">
                            {thread.attachments.map((att, idx) => (
                              <div key={idx} className="text-xs opacity-70 flex items-center gap-1">
                                <FileEdit className="h-3 w-3" />
                                {att}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>No communication yet</p>
                  <p className="text-sm">Start a conversation below</p>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button onClick={handleSendMessage} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Select a task to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Actions */}
      <div className="w-80 border-l bg-background flex flex-col">
        {selectedTask ? (
          <>
            <div className="p-4 border-b">
              <h3 className="mb-1">Task Actions</h3>
              <p className="text-sm text-muted-foreground">Perform actions on this task</p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <Card className="p-4">
                  <h4 className="mb-3 text-sm">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{selectedTask.applicationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student:</span>
                      <span>{selectedTask.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{selectedTask.assignedTo}</span>
                    </div>
                    {selectedTask.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3 text-sm">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleViewApplication}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Full Application
                    </Button>
                    
                    {selectedTask.taskType === 'amend' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleViewApplication}
                      >
                        <FileEdit className="mr-2 h-4 w-4" />
                        Review Amendments
                      </Button>
                    )}

                    {selectedTask.taskType === 'interview' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                    )}

                    {selectedTask.taskType === 'document' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileEdit className="mr-2 h-4 w-4" />
                        Review Documents
                      </Button>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleMarkComplete}
                      disabled={selectedTask.status === 'completed'}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3 text-sm">Task History</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex gap-2">
                      <div className="w-1 bg-muted rounded-full" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">Created</p>
                        <p>{new Date(selectedTask.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedTask.status === 'in-progress' && (
                      <div className="flex gap-2">
                        <div className="w-1 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-muted-foreground">Status changed to In Progress</p>
                          <p>{new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedTask.status === 'completed' && (
                      <div className="flex gap-2">
                        <div className="w-1 bg-green-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-muted-foreground">Completed</p>
                          <p>{new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
            <div>
              <ArrowRight className="h-8 w-8 mx-auto mb-2 opacity-20 rotate-180" />
              <p className="text-sm">Select a task to see available actions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}