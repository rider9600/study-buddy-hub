// Core types for StudyFlow application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  frequency: 'once' | 'daily';
  subject_id?: string;
  project_id?: string;
  goal_id?: string;
  task_date: string; // Date in YYYY-MM-DD format
  created_at: string;
  completed_at?: string;
}

export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  faculty_name?: string;
  color: string;
  syllabus?: string[];
  time_slots?: TimeSlot[];
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  subject_id?: string;
  project_id?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  deadline?: string;
  team_members?: string[];
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: string;
  progress_percentage?: number;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'class' | 'milestone' | 'deadline' | 'reminder';
  relatedId?: string;
  color?: string;
}

export interface DailyStat {
  id: string;
  user_id: string;
  stat_date: string;
  tasks_completed: number;
  tasks_created: number;
  tasks_pending: number;
  high_priority_completed: number;
  medium_priority_completed: number;
  low_priority_completed: number;
  notes_created: number;
  subjects_studied: number;
  study_sessions: number;
  total_study_minutes: number;
  projects_worked_on: number;
  goals_progress_updated: number;
  productivity_score: number;
  consistency_score: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  activity_date: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
  longest_streak_start_date: string | null;
  longest_streak_end_date: string | null;
  created_at: string;
  updated_at: string;
}
