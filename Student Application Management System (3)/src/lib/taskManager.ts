import { ApplicationStatus } from './types';

export interface ReviewTask {
  id: string;
  applicationId: string;
  applicationRef: string;
  studentName: string;
  course: string;
  assignedStaffId: string;
  assignedStaffName: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  threadIds?: string[];
}

const TASKS_STORAGE_KEY = 'review_tasks';

// Get all tasks
export const getAllTasks = (): ReviewTask[] => {
  try {
    const tasksStr = localStorage.getItem(TASKS_STORAGE_KEY);
    return tasksStr ? JSON.parse(tasksStr) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// Get tasks for a specific staff member
export const getTasksByStaffId = (staffId: string): ReviewTask[] => {
  const tasks = getAllTasks();
  return tasks.filter(task => task.assignedStaffId === staffId);
};

// Get task by application ID
export const getTaskByApplicationId = (applicationId: string): ReviewTask | undefined => {
  const tasks = getAllTasks();
  return tasks.find(task => task.applicationId === applicationId);
};

// Create a new task when application is assigned
export const createTask = (
  applicationId: string,
  applicationRef: string,
  studentName: string,
  course: string,
  assignedStaffId: string,
  assignedStaffName: string
): ReviewTask => {
  const tasks = getAllTasks();
  
  // Check if task already exists
  const existingTask = tasks.find(task => task.applicationId === applicationId);
  if (existingTask) {
    return existingTask;
  }

  const newTask: ReviewTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    applicationId,
    applicationRef,
    studentName,
    course,
    assignedStaffId,
    assignedStaffName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    threadIds: []
  };

  tasks.push(newTask);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  
  return newTask;
};

// Start a review task
export const startTask = (applicationId: string): ReviewTask | null => {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(task => task.applicationId === applicationId);
  
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: 'in_progress',
    startedAt: new Date().toISOString()
  };

  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  return tasks[taskIndex];
};

// Complete a review task
export const completeTask = (applicationId: string): ReviewTask | null => {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(task => task.applicationId === applicationId);
  
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: 'completed',
    completedAt: new Date().toISOString()
  };

  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  return tasks[taskIndex];
};

// Add thread to task
export const addThreadToTask = (applicationId: string, threadId: string): void => {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(task => task.applicationId === applicationId);
  
  if (taskIndex === -1) return;

  if (!tasks[taskIndex].threadIds) {
    tasks[taskIndex].threadIds = [];
  }

  if (!tasks[taskIndex].threadIds!.includes(threadId)) {
    tasks[taskIndex].threadIds!.push(threadId);
  }

  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

// Delete a task
export const deleteTask = (applicationId: string): void => {
  const tasks = getAllTasks();
  const filteredTasks = tasks.filter(task => task.applicationId !== applicationId);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filteredTasks));
};

// Update task assignment
export const updateTaskAssignment = (
  applicationId: string,
  assignedStaffId: string,
  assignedStaffName: string
): ReviewTask | null => {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(task => task.applicationId === applicationId);
  
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    assignedStaffId,
    assignedStaffName
  };

  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  return tasks[taskIndex];
};
