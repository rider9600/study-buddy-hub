// Database types for Supabase integration

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'completed';
          frequency: 'once' | 'daily';
          subject_id: string | null;
          project_id: string | null;
          goal_id: string | null;
          task_date: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high';
          status?: 'pending' | 'completed';
          frequency: 'once' | 'daily';
          subject_id?: string | null;
          project_id?: string | null;
          goal_id?: string | null;
          task_date: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'completed';
          frequency?: 'once' | 'daily';
          subject_id?: string | null;
          project_id?: string | null;
          goal_id?: string | null;
          task_date?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          faculty_name: string | null;
          color: string;
          syllabus: string[] | null;
          time_slots: Record<string, unknown> | null; // jsonb type
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          faculty_name?: string | null;
          color: string;
          syllabus?: string[] | null;
          time_slots?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          faculty_name?: string | null;
          color?: string;
          syllabus?: string[] | null;
          time_slots?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          subject_id: string | null;
          project_id: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          subject_id?: string | null;
          project_id?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string;
          subject_id?: string | null;
          project_id?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          deadline: string | null;
          team_members: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          deadline?: string | null;
          team_members?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          deadline?: string | null;
          team_members?: string[] | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          duration: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          duration?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          duration?: string | null;
          created_at?: string;
        };
      };
      daily_stats: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          stat_date: string;
          tasks_completed?: number;
          tasks_created?: number;
          tasks_pending?: number;
          high_priority_completed?: number;
          medium_priority_completed?: number;
          low_priority_completed?: number;
          notes_created?: number;
          subjects_studied?: number;
          study_sessions?: number;
          total_study_minutes?: number;
          projects_worked_on?: number;
          goals_progress_updated?: number;
          productivity_score?: number;
          consistency_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stat_date?: string;
          tasks_completed?: number;
          tasks_created?: number;
          tasks_pending?: number;
          high_priority_completed?: number;
          medium_priority_completed?: number;
          low_priority_completed?: number;
          notes_created?: number;
          subjects_studied?: number;
          study_sessions?: number;
          total_study_minutes?: number;
          projects_worked_on?: number;
          goals_progress_updated?: number;
          productivity_score?: number;
          consistency_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_description: string | null;
          entity_type: string | null;
          entity_id: string | null;
          activity_date: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          activity_date?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          activity_date?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      user_streaks: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          streak_type: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_start_date?: string | null;
          longest_streak_start_date?: string | null;
          longest_streak_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak_type?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_start_date?: string | null;
          longest_streak_start_date?: string | null;
          longest_streak_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};