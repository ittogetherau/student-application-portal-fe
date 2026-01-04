import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

type Task = {
  id: string;
  applicationId: string;
  studentName: string;
  taskType: "review" | "amend" | "interview" | "offer" | "message" | "document";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
  threadCount: number;
  unreadCount: number;
};

type Thread = {
  id: string;
  taskId: string;
  sender: string;
  senderRole: "agent" | "staff" | "student";
  message: string;
  timestamp: string;
  attachments?: string[];
};

const mockTasks: Task[] = [
  {
    id: "T001",
    applicationId: "APP2024001",
    studentName: "John Smith",
    taskType: "amend",
    title: "Application Amendments Required",
    description:
      "Agent has requested review after making amendments to passport details",
    priority: "high",
    status: "pending",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15T09:30:00",
    dueDate: "2024-01-17T17:00:00",
    threadCount: 3,
    unreadCount: 1,
  },
  {
    id: "T002",
    applicationId: "APP2024015",
    studentName: "Emma Wilson",
    taskType: "document",
    title: "Missing Document Upload",
    description: "Passport copy uploaded by agent - needs verification",
    priority: "medium",
    status: "pending",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15T10:15:00",
    threadCount: 1,
    unreadCount: 0,
  },
  {
    id: "T003",
    applicationId: "APP2024008",
    studentName: "Michael Chen",
    taskType: "interview",
    title: "Schedule GS Interview",
    description:
      "Student requested interview reschedule due to time zone conflict",
    priority: "high",
    status: "in-progress",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15T11:00:00",
    dueDate: "2024-01-16T17:00:00",
    threadCount: 5,
    unreadCount: 2,
  },
];

const mockThreads: Thread[] = [
  {
    id: "TH001",
    taskId: "T001",
    sender: "ABC Education Agency",
    senderRole: "agent",
    message:
      "We have updated the passport details as requested. The passport number has been corrected and a new copy has been uploaded. Please review.",
    timestamp: "2024-01-15T09:30:00",
    attachments: ["passport_updated.pdf"],
  },
  {
    id: "TH002",
    taskId: "T001",
    sender: "Sarah Johnson",
    senderRole: "staff",
    message: "Thank you. I will review the updated documents within 24 hours.",
    timestamp: "2024-01-15T09:45:00",
  },
  {
    id: "TH003",
    taskId: "T001",
    sender: "ABC Education Agency",
    senderRole: "agent",
    message: "Just following up - has the review been completed?",
    timestamp: "2024-01-15T14:30:00",
  },
];

const selectedTask = mockTasks[0];

const getTaskTypeIcon = (type: Task["taskType"]) => {
  switch (type) {
    case "review":
      return <Eye className="h-4 w-4" />;
    case "amend":
      return <FileEdit className="h-4 w-4" />;
    case "interview":
      return <Calendar className="h-4 w-4" />;
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "document":
      return <FileEdit className="h-4 w-4" />;
    case "offer":
      return <Send className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getPriorityVariant = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "default" as const;
    case "low":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

const getStatusVariant = (status: Task["status"]) => {
  switch (status) {
    case "pending":
      return "default" as const;
    case "in-progress":
      return "default" as const;
    case "completed":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StaffTasksStatic() {
  const threadsForSelected = mockThreads.filter(
    (t) => t.taskId === selectedTask.id
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/30">
      {/* Left Sidebar - Task List (static) */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="mb-4">My Tasks</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value=""
              readOnly
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {mockTasks.map((task) => {
              const isActive = task.id === selectedTask.id;

              return (
                <Card
                  key={task.id}
                  className={`mb-2 p-3 transition-colors ${
                    isActive
                      ? "border-primary bg-muted/50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="mt-0.5">
                      {getTaskTypeIcon(task.taskType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {task.applicationId}
                        </span>
                        <Badge
                          variant={getPriorityVariant(task.priority)}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <p className="text-sm truncate mb-1">
                        {task.studentName}
                      </p>
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
                          <Badge
                            variant="destructive"
                            className="h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                          >
                            {task.unreadCount}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {mockTasks.length} tasks •{" "}
            {mockTasks.filter((t) => t.status === "pending").length} pending
          </div>
        </div>
      </div>

      {/* Middle Section - Communication Threads (static) */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar (static) */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Filters</span>
          </div>

          <div className="flex gap-2">
            <Select value="all" disabled>
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

            <Select value="all" disabled>
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

            <Select value="all" disabled>
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

        {/* Selected Task Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="mb-1">{selectedTask.title}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTask.description}
              </p>
            </div>

            <Badge variant={getStatusVariant(selectedTask.status)}>
              {selectedTask.status.replace("-", " ")}
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

        {/* Thread Display */}
        <ScrollArea className="flex-1 p-4">
          {threadsForSelected.length > 0 ? (
            <div className="space-y-4">
              {threadsForSelected.map((thread) => (
                <div
                  key={thread.id}
                  className={`flex ${
                    thread.senderRole === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      thread.senderRole === "staff"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-lg p-3`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-70">
                        {thread.sender}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatTimestamp(thread.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm">{thread.message}</p>

                    {thread.attachments?.length ? (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        {thread.attachments.map((att) => (
                          <div
                            key={att}
                            className="text-xs opacity-70 flex items-center gap-1"
                          >
                            <FileEdit className="h-3 w-3" />
                            {att}
                          </div>
                        ))}
                      </div>
                    ) : null}
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

        {/* Composer (static) */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[80px] resize-none"
              value=""
              readOnly
            />
            <Button className="shrink-0" disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Actions (static) */}
      <div className="w-80 border-l bg-background flex flex-col">
        <div className="p-4 border-b">
          <h3 className="mb-1">Task Actions</h3>
          <p className="text-sm text-muted-foreground">
            Perform actions on this task
          </p>
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

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={getPriorityVariant(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span>{selectedTask.assignedTo}</span>
                </div>

                {selectedTask.dueDate ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="mb-3 text-sm">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Application
                </Button>

                {selectedTask.taskType === "amend" ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Review Amendments
                  </Button>
                ) : null}

                {selectedTask.taskType === "interview" ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                ) : null}

                {selectedTask.taskType === "document" ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Review Documents
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
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

                {selectedTask.status === "in-progress" ? (
                  <div className="flex gap-2">
                    <div className="w-1 bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">
                        Status changed to In Progress
                      </p>
                      <p>{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                ) : null}

                {selectedTask.status === "completed" ? (
                  <div className="flex gap-2">
                    <div className="w-1 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">Completed</p>
                      <p>{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* <div className="p-4 border-t bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
          <ArrowRight className="h-4 w-4 rotate-180 opacity-60" />
          Static UI only (no interactions)
        </div> */}
      </div>
    </div>
  );
}
