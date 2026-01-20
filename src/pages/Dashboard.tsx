import { useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  format,
  isToday,
  isTomorrow,
  parseISO,
  isPast,
  isThisWeek,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
} from "date-fns";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  BookMarked,
  FileText,
  FolderKanban,
  Target,
  Calendar,
  Plus,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, subjects, notes, projects, goals } = useData();
  const [productivityView, setProductivityView] = useState<"week" | "month">(
    "week",
  );

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const todaysTasks = pendingTasks.slice(0, 5);

  const overdueTasks = pendingTasks.filter(
    (t) => t.deadline && isPast(parseISO(t.deadline)),
  );
  const todayTasks = pendingTasks.filter(
    (t) => t.deadline && isToday(parseISO(t.deadline)),
  );
  const thisWeekTasks = pendingTasks.filter(
    (t) => t.deadline && isThisWeek(parseISO(t.deadline)),
  );

  const activeProjects = projects.filter((p) => p.status === "active");
  const recentNotes = [...notes]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  // Productivity data calculation with week/month toggle and weighted progress
  const productivityData = useMemo(() => {
    const days = productivityView === "week" ? 7 : 30;
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date(),
    });

    // Weight system for different priorities
    const getTaskWeight = (task: any) => {
      let weight = 1; // Base weight

      // Priority weights
      switch (task.priority) {
        case "high":
          weight *= 3;
          break;
        case "medium":
          weight *= 2;
          break;
        case "low":
          weight *= 1;
          break;
      }

      // Frequency weights (daily tasks are more valuable when completed)
      if (task.frequency === "daily") {
        weight *= 1.5;
      }

      // Subject-linked tasks get slight bonus
      if (task.subjectId) {
        weight *= 1.2;
      }

      return weight;
    };

    const dailyProductivity = dateRange.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Get tasks completed on this day (regardless of original deadline)
      const completedTasks = tasks.filter((task) => {
        if (task.status !== "completed" || !task.completedAt) return false;
        const completedDate = parseISO(task.completedAt);
        return completedDate >= dayStart && completedDate <= dayEnd;
      });

      // Get all pending tasks for this day (includes overdue and current day tasks)
      const pendingTasks = tasks.filter((task) => {
        if (task.status === "completed") return false;

        // If task has no deadline, it's always pending
        if (!task.deadline) return true;

        // If task deadline is today or past, it's pending for today
        const taskDate = parseISO(task.deadline);
        return taskDate <= dayEnd;
      });

      // Calculate weights
      let totalWeight = 0;
      let completedWeight = 0;

      // Add completed task weights
      completedTasks.forEach((task) => {
        const weight = getTaskWeight(task);
        completedWeight += weight;
      });

      // Total weight includes both completed and pending tasks
      const allRelevantTasks = [
        ...new Set([...completedTasks, ...pendingTasks]),
      ];
      allRelevantTasks.forEach((task) => {
        totalWeight += getTaskWeight(task);
      });

      // Calculate productivity
      let productivity = 0;
      if (totalWeight > 0) {
        productivity = Math.round((completedWeight / totalWeight) * 100);
      }

      // Get additional info for tooltip
      const dayName = format(day, "EEEE") as any;
      const studySessions = subjects.reduce((count, subject) => {
        if (!subject.timeSlots) return count;
        return (
          count +
          subject.timeSlots.filter((slot) => slot.day === dayName).length
        );
      }, 0);

      const dayNotes = notes.filter((note) => {
        const createdDate = parseISO(note.createdAt);
        return createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      return {
        date:
          productivityView === "week" ? format(day, "EEE") : format(day, "d"),
        fullDate: format(day, "MMM d, yyyy"),
        productivity,
        completed: completedTasks.length,
        total: allRelevantTasks.length,
        pending: pendingTasks.length,
        studySessions,
        notesCreated: dayNotes,
        totalWeight: Math.round(totalWeight * 10) / 10,
        completedWeight: Math.round(completedWeight * 10) / 10,
      };
    });

    return dailyProductivity;
  }, [tasks, subjects, notes, productivityView]);

  // Debug function to show productivity calculation breakdown
  const logProductivityBreakdown = (dayData: any) => {
    console.group(`🔍 PRODUCTIVITY BREAKDOWN - ${dayData.fullDate}`);

    const dayStart = new Date(dayData.fullDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayData.fullDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Get tasks completed on this day
    const completedTasks = tasks.filter((task) => {
      if (task.status !== "completed" || !task.completedAt) return false;
      const completedDate = parseISO(task.completedAt);
      return completedDate >= dayStart && completedDate <= dayEnd;
    });

    // Get all pending tasks for this day
    const pendingTasks = tasks.filter((task) => {
      if (task.status === "completed") return false;

      // If task has no deadline, it's always pending
      if (!task.deadline) return true;

      // If task deadline is today or past, it's pending for today
      const taskDate = parseISO(task.deadline);
      return taskDate <= dayEnd;
    });

    console.log(`📊 SUMMARY:`);
    console.log(`Final Productivity: ${dayData.productivity}%`);
    console.log(`Tasks Completed: ${completedTasks.length}`);
    console.log(`Tasks Pending: ${pendingTasks.length}`);

    console.log(`\n✅ COMPLETED TASKS ON THIS DAY:`);
    let totalCompletedWeight = 0;
    completedTasks.forEach((task, index) => {
      let weight = 1;

      // Priority weights
      switch (task.priority) {
        case "high":
          weight *= 3;
          break;
        case "medium":
          weight *= 2;
          break;
        case "low":
          weight *= 1;
          break;
      }

      // Frequency bonus
      if (task.frequency === "daily") weight *= 1.5;

      // Subject bonus
      if (task.subjectId) weight *= 1.2;

      totalCompletedWeight += weight;

      console.log(`${index + 1}. "${task.title}"`);
      console.log(
        `   Priority: ${task.priority} (${task.priority === "high" ? "3x" : task.priority === "medium" ? "2x" : "1x"})`,
      );
      console.log(
        `   Frequency: ${task.frequency || "once"} ${task.frequency === "daily" ? "(+50% bonus)" : ""}`,
      );
      console.log(
        `   Subject-linked: ${task.subjectId ? "Yes (+20% bonus)" : "No"}`,
      );
      console.log(`   Final Weight: ${weight.toFixed(2)}`);
      console.log(`   Completed At: ${task.completedAt}`);
    });

    console.log(`\n📅 PENDING TASKS FOR THIS DAY:`);
    let totalPendingWeight = 0;
    pendingTasks.forEach((task, index) => {
      let weight = 1;

      switch (task.priority) {
        case "high":
          weight *= 3;
          break;
        case "medium":
          weight *= 2;
          break;
        case "low":
          weight *= 1;
          break;
      }

      if (task.frequency === "daily") weight *= 1.5;
      if (task.subjectId) weight *= 1.2;

      totalPendingWeight += weight;

      console.log(`${index + 1}. "${task.title}"`);
      console.log(
        `   Priority: ${task.priority} (Weight: ${weight.toFixed(2)})`,
      );
      console.log(`   Status: ${task.status}`);
      console.log(`   Deadline: ${task.deadline || "No deadline"}`);
    });

    console.log(`\n🧮 CALCULATION:`);
    console.log(`Total Completed Weight: ${totalCompletedWeight.toFixed(2)}`);
    console.log(`Total Pending Weight: ${totalPendingWeight.toFixed(2)}`);

    let finalTotalWeight = Math.max(totalCompletedWeight, totalPendingWeight);
    console.log(`Final Total Weight: ${finalTotalWeight.toFixed(2)}`);

    if (finalTotalWeight > 0) {
      const percentage = (totalCompletedWeight / finalTotalWeight) * 100;
      console.log(
        `Formula: (${totalCompletedWeight.toFixed(2)} / ${finalTotalWeight.toFixed(2)}) × 100 = ${percentage.toFixed(2)}%`,
      );
      console.log(`Rounded: ${Math.round(percentage)}%`);
    } else {
      console.log(`No tasks = 0% productivity`);
    }

    console.groupEnd();
  };

  const subjectProgressData = useMemo(() => {
    return subjects
      .map((subject) => {
        const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
        const completedTasks = subjectTasks.filter(
          (t) => t.status === "completed",
        ).length;
        const totalTasks = subjectTasks.length;
        const progress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          subject: subject.name,
          progress: Math.round(progress),
          completed: completedTasks,
          total: totalTasks,
          color: subject.color,
        };
      })
      .filter((s) => s.total > 0);
  }, [subjects, tasks]);

  const taskPriorityData = useMemo(() => {
    const high = pendingTasks.filter((t) => t.priority === "high").length;
    const medium = pendingTasks.filter((t) => t.priority === "medium").length;
    const low = pendingTasks.filter((t) => t.priority === "low").length;

    return [
      { priority: "High", value: high, color: "#ef4444" },
      { priority: "Medium", value: medium, color: "#f59e0b" },
      { priority: "Low", value: low, color: "#6b7280" },
    ].filter((item) => item.value > 0);
  }, [pendingTasks]);

  const stats = [
    {
      label: "Pending Tasks",
      value: pendingTasks.length,
      icon: CheckSquare,
      color: "text-chart-1",
    },
    {
      label: "Subjects",
      value: subjects.length,
      icon: BookMarked,
      color: "text-chart-2",
    },
    {
      label: "Notes",
      value: notes.length,
      icon: FileText,
      color: "text-chart-3",
    },
    {
      label: "Active Projects",
      value: activeProjects.length,
      icon: FolderKanban,
      color: "text-chart-4",
    },
    {
      label: "Goals",
      value: goals.length,
      icon: Target,
      color: "text-chart-5",
    },
  ];

  const formatDeadline = (deadline: string) => {
    const date = parseISO(deadline);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive";
      case "medium":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          , {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your studies today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="shadow-soft hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              You have {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""}!
            </p>
            <Link to="/tasks" className="ml-auto">
              <Button size="sm" variant="destructive">
                View Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Productivity Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Productivity Analytics</h2>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Daily Activity Chart */}
          <Card className="shadow-soft lg:col-span-2 xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Daily Productivity
                </CardTitle>
                <Tabs
                  value={productivityView}
                  onValueChange={(v) =>
                    setProductivityView(v as "week" | "month")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  productivity: {
                    label: "Productivity %",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={productivityData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    onClick={(data) => {
                      if (
                        data &&
                        data.activePayload &&
                        data.activePayload.length > 0
                      ) {
                        logProductivityBreakdown(data.activePayload[0].payload);
                      }
                    }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                      axisLine={{ strokeWidth: 1 }}
                      tickLine={{ strokeWidth: 1 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                      axisLine={{ strokeWidth: 1 }}
                      tickLine={{ strokeWidth: 1 }}
                      label={{
                        value: "Productivity %",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border rounded-lg shadow-lg p-4 min-w-[200px]">
                              <p className="font-medium text-gray-900 mb-2">
                                {data.fullDate}
                              </p>

                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">
                                    Daily Productivity:
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {data.completed > 0 || data.pending > 0
                                      ? `${data.productivity}%`
                                      : "No activity"}
                                  </span>
                                </div>

                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Tasks Completed:
                                    </span>
                                    <span className="text-green-600 font-medium">
                                      {data.completed}
                                    </span>
                                  </div>

                                  {data.pending > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Tasks Pending:
                                      </span>
                                      <span className="text-orange-600">
                                        {data.pending}
                                      </span>
                                    </div>
                                  )}

                                  {(data.completed > 0 || data.pending > 0) && (
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <span>Weighted Score:</span>
                                      <span>
                                        {data.completedWeight}/
                                        {data.totalWeight}
                                      </span>
                                    </div>
                                  )}

                                  {(data.studySessions > 0 ||
                                    data.notesCreated > 0) && (
                                    <div className="border-t pt-2 mt-2 text-xs text-gray-500">
                                      <div className="mb-1 font-medium">
                                        Additional Activity:
                                      </div>
                                      {data.studySessions > 0 && (
                                        <div className="flex justify-between">
                                          <span>Study Sessions:</span>
                                          <span>{data.studySessions}</span>
                                        </div>
                                      )}
                                      {data.notesCreated > 0 && (
                                        <div className="flex justify-between">
                                          <span>Notes Created:</span>
                                          <span>{data.notesCreated}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="productivity"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                      style={{ cursor: "pointer" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Task Priority Breakdown */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Task Priority</CardTitle>
            </CardHeader>
            <CardContent>
              {taskPriorityData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending tasks
                </p>
              ) : (
                <ChartContainer
                  config={{
                    high: { label: "High Priority", color: "#ef4444" },
                    medium: { label: "Medium Priority", color: "#f59e0b" },
                    low: { label: "Low Priority", color: "#6b7280" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <Pie
                        data={taskPriorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="priority"
                      >
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        {subjectProgressData.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgressData.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.subject}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {subject.completed}/{subject.total} tasks (
                        {subject.progress}%)
                      </span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Remaining Tasks */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Remaining Tasks
            </CardTitle>
            <Link to="/tasks">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No pending tasks. You're all caught up!
              </p>
            ) : (
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <Link key={task.id} to="/tasks" className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        {task.subjectId &&
                          subjects.find((s) => s.id === task.subjectId) && (
                            <p className="text-xs text-muted-foreground">
                              {
                                subjects.find((s) => s.id === task.subjectId)
                                  ?.name
                              }
                            </p>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Active Projects
            </CardTitle>
            <Link to="/projects">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                New Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No active projects. Start one today!
              </p>
            ) : (
              <div className="space-y-4">
                {activeProjects.slice(0, 3).map((project) => {
                  const completedMilestones = project.milestones.filter(
                    (m) => m.completed,
                  ).length;
                  const progress =
                    project.milestones.length > 0
                      ? (completedMilestones / project.milestones.length) * 100
                      : 0;

                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{project.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {completedMilestones}/{project.milestones.length}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Notes
            </CardTitle>
            <Link to="/notes">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                New Note
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentNotes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No notes yet. Start taking notes!
              </p>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated{" "}
                      {format(parseISO(note.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Self-Improvement Goals
            </CardTitle>
            <Link to="/goals">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                New Goal
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No goals set. Set your first goal!
              </p>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{goal.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/tasks">
              <Button variant="outline" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                Add Task
              </Button>
            </Link>
            <Link to="/notes">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Take Notes
              </Button>
            </Link>
            <Link to="/subjects">
              <Button variant="outline" className="gap-2">
                <BookMarked className="w-4 h-4" />
                Add Subject
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                View Calendar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
