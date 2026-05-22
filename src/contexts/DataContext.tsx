import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type {
  Task,
  Subject,
  Note,
  Project,
  Goal,
  ActivityLog,
  DailyStat,
  UserStreak,
} from "@/types";

interface DataContextType {
  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  addTask: (task: Omit<Task, "id" | "user_id" | "created_at">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;

  // Subjects
  subjects: Subject[];
  subjectsLoading: boolean;
  addSubject: (
    subject: Omit<Subject, "id" | "user_id" | "created_at">,
  ) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Notes
  notes: Note[];
  notesLoading: boolean;
  addNote: (
    note: Omit<Note, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Projects
  projects: Project[];
  projectsLoading: boolean;
  addProject: (
    project: Omit<Project, "id" | "user_id" | "created_at">,
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Goals
  goals: Goal[];
  goalsLoading: boolean;
  addGoal: (goal: Omit<Goal, "id" | "user_id" | "created_at">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Productivity & Analytics
  recentActivities: ActivityLog[];
  dailyStats: DailyStat[];
  currentStreak: UserStreak | null;
  fetchRecentActivities: () => Promise<void>;
  fetchDailyStats: (days?: number) => Promise<void>;
  fetchCurrentStreak: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Productivity states
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [currentStreak, setCurrentStreak] = useState<UserStreak | null>(null);

  // Load all data from Supabase on mount and user change
  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.id) {
        setTasks([]);
        setTasksLoading(false);
        setSubjects([]);
        setSubjectsLoading(false);
        setNotes([]);
        setNotesLoading(false);
        setProjects([]);
        setProjectsLoading(false);
        setGoals([]);
        setGoalsLoading(false);
        return;
      }

      try {
        // Load subjects
        setSubjectsLoading(true);
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setSubjects(subjectsData || []);

        // Load tasks
        setTasksLoading(true);
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setTasks(tasksData || []);

        // Load notes
        setNotesLoading(true);
        const { data: notesData } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setNotes(notesData || []);

        // Load projects
        setProjectsLoading(true);
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setProjects(projectsData || []);

        // Load goals
        setGoalsLoading(true);
        const { data: goalsData } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setGoals(goalsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setTasksLoading(false);
        setSubjectsLoading(false);
        setNotesLoading(false);
        setProjectsLoading(false);
        setGoalsLoading(false);
      }
    };

    loadAllData();
  }, [user?.id]);

  // Productivity helper functions (defined before CRUD operations that use them)
  const logActivity = useCallback(
    async (
      activityType: string,
      description: string,
      entityType?: string,
      entityId?: string,
      metadata?: Record<string, unknown>,
    ) => {
      if (!user?.id) return;

      try {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          activity_type: activityType,
          activity_description: description,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata,
        });
      } catch (error) {
        console.error("Error logging activity:", error);
      }
    },
    [user?.id],
  );

  const updateDailyStats = useCallback(
    async (date: string = new Date().toISOString().split("T")[0]) => {
      if (!user?.id) return;

      try {
        // This will be handled by the database trigger, but we can also call it manually
        await supabase.rpc("update_daily_stats", {
          p_user_id: user.id,
          p_stat_date: date,
        });
      } catch (error) {
        // Silently fail if function doesn't exist yet
        console.log("Daily stats update skipped (function not yet created)");
      }
    },
    [user?.id],
  );

  // Task operations
  const addTask = useCallback(
    async (task: Omit<Task, "id" | "user_id" | "created_at">) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const insertData = {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status || "pending",
          frequency: task.frequency,
          subject_id: task.subject_id,
          project_id: task.project_id,
          goal_id: task.goal_id,
          task_date: task.task_date,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("tasks")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error adding task:", error);
          return;
        }

        if (data) {
          setTasks((prev) => [data, ...prev]);
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    },
    [user?.id],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating task:", error);
          return;
        }

        if (data) {
          setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    [user?.id],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting task:", error);
          return;
        }

        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    [user?.id],
  );

  const completeTask = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const task = tasks.find((t) => t.id === id);

        const { data, error } = await supabase
          .from("tasks")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error completing task:", error);
          return;
        }

        if (data) {
          setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));

          // Log activity
          await logActivity(
            "task_completed",
            `Completed task: ${task?.title || "Unknown"}`,
            "task",
            id,
            {
              priority: data.priority,
              frequency: data.frequency,
              subject_id: data.subject_id,
            },
          );

          // Update daily stats
          await updateDailyStats();
        }
      } catch (error) {
        console.error("Error completing task:", error);
      }
    },
    [user?.id, tasks, logActivity, updateDailyStats],
  );

  // Subject operations
  const addSubject = useCallback(
    async (subject: Omit<Subject, "id" | "user_id" | "created_at">) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const insertData = {
          name: subject.name,
          faculty_name: subject.faculty_name,
          color: subject.color,
          syllabus: subject.syllabus,
          time_slots: subject.time_slots,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("subjects")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error adding subject:", error);
          return;
        }

        if (data) {
          setSubjects((prev) => [data, ...prev]);

          // Log activity
          await logActivity(
            "subject_added",
            `Added subject: ${data.name}`,
            "subject",
            data.id,
          );
        }
      } catch (error) {
        console.error("Error adding subject:", error);
      }
    },
    [user?.id, logActivity],
  );

  const updateSubject = useCallback(
    async (id: string, updates: Partial<Subject>) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subjects")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating subject:", error);
          return;
        }

        if (data) {
          setSubjects((prev) => prev.map((s) => (s.id === id ? data : s)));
        }
      } catch (error) {
        console.error("Error updating subject:", error);
      }
    },
    [user?.id],
  );

  const deleteSubject = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { error } = await supabase
          .from("subjects")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting subject:", error);
          return;
        }

        setSubjects((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    },
    [user?.id],
  );

  // Note operations
  const addNote = useCallback(
    async (
      note: Omit<Note, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const insertData = {
          title: note.title,
          content: note.content,
          subject_id: note.subject_id,
          project_id: note.project_id,
          tags: note.tags,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("notes")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error adding note:", error);
          return;
        }

        if (data) {
          setNotes((prev) => [data, ...prev]);

          // Log activity
          await logActivity(
            "note_created",
            `Created note${data.title ? `: ${data.title}` : ""}`,
            "note",
            data.id,
            { subject_id: data.subject_id, project_id: data.project_id },
          );
        }
      } catch (error) {
        console.error("Error adding note:", error);
      }
    },
    [user?.id, logActivity],
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("notes")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating note:", error);
          return;
        }

        if (data) {
          setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }
    },
    [user?.id],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { error } = await supabase
          .from("notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting note:", error);
          return;
        }

        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    },
    [user?.id],
  );

  // Project operations
  const addProject = useCallback(
    async (project: Omit<Project, "id" | "user_id" | "created_at">) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const insertData = {
          name: project.name,
          description: project.description,
          deadline: project.deadline,
          team_members: project.team_members,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("projects")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error adding project:", error);
          return;
        }

        if (data) {
          setProjects((prev) => [data, ...prev]);
        }
      } catch (error) {
        console.error("Error adding project:", error);
      }
    },
    [user?.id],
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating project:", error);
          return;
        }

        if (data) {
          setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
        }
      } catch (error) {
        console.error("Error updating project:", error);
      }
    },
    [user?.id],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting project:", error);
          return;
        }

        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    },
    [user?.id],
  );

  // Goal operations
  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "user_id" | "created_at">) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const insertData = {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          duration: goal.duration,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("goals")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error adding goal:", error);
          return;
        }

        if (data) {
          setGoals((prev) => [data, ...prev]);
        }
      } catch (error) {
        console.error("Error adding goal:", error);
      }
    },
    [user?.id],
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("goals")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating goal:", error);
          return;
        }

        if (data) {
          setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
        }
      } catch (error) {
        console.error("Error updating goal:", error);
      }
    },
    [user?.id],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user?.id) {
        console.error("No user logged in");
        return;
      }

      try {
        const { error } = await supabase
          .from("goals")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting goal:", error);
          return;
        }

        setGoals((prev) => prev.filter((g) => g.id !== id));
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    },
    [user?.id],
  );

  // Productivity data fetching operations
  const fetchRecentActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching activities:", error);
        return;
      }

      setRecentActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [user?.id]);

  const fetchDailyStats = useCallback(
    async (days: number = 30) => {
      if (!user?.id) return;

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("daily_stats")
          .select("*")
          .eq("user_id", user.id)
          .gte("stat_date", startDateStr)
          .order("stat_date", { ascending: true });

        if (error) {
          console.error("Error fetching daily stats:", error);
          return;
        }

        setDailyStats(data || []);
      } catch (error) {
        console.error("Error fetching daily stats:", error);
      }
    },
    [user?.id],
  );

  const fetchCurrentStreak = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .eq("streak_type", "daily_task")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error fetching streak:", error);
        return;
      }

      setCurrentStreak(data || null);
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  }, [user?.id]);

  // Load productivity data when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchRecentActivities();
      fetchDailyStats();
      fetchCurrentStreak();
    }
  }, [user?.id, fetchRecentActivities, fetchDailyStats, fetchCurrentStreak]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        tasksLoading,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        subjects,
        subjectsLoading,
        addSubject,
        updateSubject,
        deleteSubject,
        notes,
        notesLoading,
        addNote,
        updateNote,
        deleteNote,
        projects,
        projectsLoading,
        addProject,
        updateProject,
        deleteProject,
        goals,
        goalsLoading,
        addGoal,
        updateGoal,
        deleteGoal,
        recentActivities,
        dailyStats,
        currentStreak,
        fetchRecentActivities,
        fetchDailyStats,
        fetchCurrentStreak,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
