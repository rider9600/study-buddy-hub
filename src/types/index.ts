// Core types for StudyFlow application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  frequency?: 'once' | 'daily';
  subjectId?: string;
  projectId?: string;
  goalId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Subject {
  id: string;
  name: string;
  facultyName?: string;
  schedule?: string;
  timeSlots?: TimeSlot[];
  color: string;
  syllabus?: string[];
  createdAt: string;
  userId?: string;
}

export interface StudyMaterial {
  id: string;
  subjectId: string;
  title: string;
  type: 'file' | 'link' | 'reference';
  url?: string;
  content?: string;
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  projectId?: string;
  goalId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: 'active' | 'completed' | 'archived';
  teamMembers?: string[];
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: 'skill' | 'habit' | 'learning' | 'other';
  duration?: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'class' | 'milestone' | 'deadline' | 'reminder';
  relatedId?: string;
  color?: string;
}
