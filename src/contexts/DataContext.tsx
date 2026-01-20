import React, { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "./AuthContext";
import type {
  Task,
  Subject,
  Note,
  Project,
  Goal,
  StudyMaterial,
} from "@/types";

interface DataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, "id" | "createdAt">) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Materials
  materials: StudyMaterial[];
  addMaterial: (material: Omit<StudyMaterial, "id" | "createdAt">) => void;
  deleteMaterial: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [tasks, setTasks] = useLocalStorage<Task[]>(
    `studyflow_tasks_${userId}`,
    [],
  );
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(
    `studyflow_subjects_${userId}`,
    [],
  );
  const [notes, setNotes] = useLocalStorage<Note[]>(
    `studyflow_notes_${userId}`,
    [],
  );
  const [projects, setProjects] = useLocalStorage<Project[]>(
    `studyflow_projects_${userId}`,
    [],
  );
  const [goals, setGoals] = useLocalStorage<Goal[]>(
    `studyflow_goals_${userId}`,
    [],
  );
  const [materials, setMaterials] = useLocalStorage<StudyMaterial[]>(
    `studyflow_materials_${userId}`,
    [],
  );

  // Task operations
  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      console.log("DataContext: addTask called with:", task);
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      console.log("DataContext: Created new task:", newTask);
      setTasks((prev) => {
        const updated = [...prev, newTask];
        console.log("DataContext: Updated tasks array:", updated);
        return updated;
      });
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks],
  );

  const completeTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
              }
            : t,
        ),
      );
    },
    [setTasks],
  );

  // Subject operations
  const addSubject = useCallback(
    (subject: Omit<Subject, "id" | "createdAt">) => {
      const newSubject: Subject = {
        ...subject,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        userId: userId,
      };
      setSubjects((prev) => [...prev, newSubject]);
    },
    [setSubjects, userId],
  );

  const updateSubject = useCallback(
    (id: string, updates: Partial<Subject>) => {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [setSubjects],
  );

  const deleteSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    },
    [setSubjects],
  );

  // Note operations
  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      console.log("DataContext: addNote called with:", note);
      const now = new Date().toISOString();
      const newNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      console.log("DataContext: Created new note:", newNote);
      setNotes((prev) => {
        const updated = [...prev, newNote];
        console.log("DataContext: Updated notes array:", updated);
        return updated;
      });
    },
    [setNotes],
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n,
        ),
      );
    },
    [setNotes],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes],
  );

  // Project operations
  const addProject = useCallback(
    (project: Omit<Project, "id" | "createdAt">) => {
      const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, newProject]);
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects],
  );

  // Goal operations
  const addGoal = useCallback(
    (goal: Omit<Goal, "id" | "createdAt">) => {
      const newGoal: Goal = {
        ...goal,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
    },
    [setGoals],
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      );
    },
    [setGoals],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals],
  );

  // Material operations
  const addMaterial = useCallback(
    (material: Omit<StudyMaterial, "id" | "createdAt">) => {
      const newMaterial: StudyMaterial = {
        ...material,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setMaterials((prev) => [...prev, newMaterial]);
    },
    [setMaterials],
  );

  const deleteMaterial = useCallback(
    (id: string) => {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    },
    [setMaterials],
  );

  return (
    <DataContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        notes,
        addNote,
        updateNote,
        deleteNote,
        projects,
        addProject,
        updateProject,
        deleteProject,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        materials,
        addMaterial,
        deleteMaterial,
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
