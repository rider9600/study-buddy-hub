import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Plus, Trash2, Edit, CheckCircle2, Circle } from "lucide-react";
import type { Task } from "@/types";

export default function Tasks() {
  const {
    tasks,
    subjects,
    projects,
    goals,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">(
    "pending",
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    frequency: "once" as "once" | "daily",
    subjectId: "none",
    projectId: "none",
    goalId: "none",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      frequency: "once",
      subjectId: "none",
      projectId: "none",
      goalId: "none",
    });
    setEditingTask(null);
  };

  const handleSubmit = () => {
    console.log("Tasks handleSubmit called with formData:", formData);

    if (!formData.title.trim()) {
      console.warn("Task title is empty, aborting submit");
      alert("Please enter a task name");
      return;
    }

    try {
      if (editingTask) {
        console.log("Updating existing task:", editingTask.id);
        updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          subjectId:
            formData.subjectId === "none" ? undefined : formData.subjectId,
          projectId:
            formData.projectId === "none" ? undefined : formData.projectId,
          goalId: formData.goalId === "none" ? undefined : formData.goalId,
        });
      } else {
        console.log("Creating new task");
        addTask({
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: "pending",
          frequency: formData.frequency,
          subjectId:
            formData.subjectId === "none" ? undefined : formData.subjectId,
          projectId:
            formData.projectId === "none" ? undefined : formData.projectId,
          goalId: formData.goalId === "none" ? undefined : formData.goalId,
        });
      }

      console.log("Task operation successful, closing dialog");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Error saving task. Please try again.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      frequency: task.frequency || "once",
      subjectId: task.subjectId || "none",
      projectId: task.projectId || "none",
      goalId: task.goalId || "none",
    });
    setIsDialogOpen(true);
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "pending") return task.status === "pending";
      if (filter === "completed") return task.status === "completed";
      return true;
    })
    .sort((a, b) => {
      // Sort by deadline, then priority
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // Calculate overdue tasks from previous days
  const overdueTasks = tasks
    .filter((task) => {
      if (task.status === "completed" || !task.deadline) return false;
      const taskDate = parseISO(task.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
    })
    .sort((a, b) => {
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "medium":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and priorities
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            console.log("Tasks dialog open state changed:", open);
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                console.log("Add Task button clicked");
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Add New Task"}
              </DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update your task details."
                  : "Create a new task with deadline and priority."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Name *</Label>
                <Input
                  id="title"
                  placeholder="Enter task name"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Task["priority"]) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: "once" | "daily") =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link to Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Link to Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({tasks.filter((t) => t.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {filter === "pending"
                  ? "No pending tasks. You're all caught up!"
                  : filter === "completed"
                    ? "No completed tasks yet."
                    : "No tasks yet. Add your first task!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`shadow-soft transition-all hover:shadow-md ${
                task.status === "completed" ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      task.status === "pending" && completeTask(task.id)
                    }
                    className="mt-0.5 shrink-0"
                    disabled={task.status === "completed"}
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                          {task.frequency === "daily" && (
                            <Badge variant="secondary" className="text-xs">
                              Daily
                            </Badge>
                          )}
                          {task.subjectId &&
                            subjects.find((s) => s.id === task.subjectId) && (
                              <Badge variant="secondary">
                                {
                                  subjects.find((s) => s.id === task.subjectId)
                                    ?.name
                                }
                              </Badge>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(task)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
