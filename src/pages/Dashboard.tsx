import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, isToday, isTomorrow, parseISO, isPast, isThisWeek } from 'date-fns';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, subjects, notes, projects, goals } = useData();

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingTasks = pendingTasks
    .filter(t => t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  const overdueTasks = pendingTasks.filter(t => t.deadline && isPast(parseISO(t.deadline)));
  const todayTasks = pendingTasks.filter(t => t.deadline && isToday(parseISO(t.deadline)));
  const thisWeekTasks = pendingTasks.filter(t => t.deadline && isThisWeek(parseISO(t.deadline)));

  const activeProjects = projects.filter(p => p.status === 'active');
  const recentNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 3);

  const stats = [
    { label: 'Pending Tasks', value: pendingTasks.length, icon: CheckSquare, color: 'text-chart-1' },
    { label: 'Subjects', value: subjects.length, icon: BookMarked, color: 'text-chart-2' },
    { label: 'Notes', value: notes.length, icon: FileText, color: 'text-chart-3' },
    { label: 'Active Projects', value: activeProjects.length, icon: FolderKanban, color: 'text-chart-4' },
    { label: 'Goals', value: goals.length, icon: Target, color: 'text-chart-5' },
  ];

  const formatDeadline = (deadline: string) => {
    const date = parseISO(deadline);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your studies today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-soft hover:shadow-md transition-shadow">
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
              You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}!
            </p>
            <Link to="/tasks" className="ml-auto">
              <Button size="sm" variant="destructive">View Tasks</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
            <Link to="/tasks">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No upcoming tasks. You're all caught up!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      {task.subjectId && subjects.find(s => s.id === task.subjectId) && (
                        <p className="text-xs text-muted-foreground">
                          {subjects.find(s => s.id === task.subjectId)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary">
                        {formatDeadline(task.deadline!)}
                      </Badge>
                    </div>
                  </div>
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
                  const completedMilestones = project.milestones.filter(m => m.completed).length;
                  const progress = project.milestones.length > 0 
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
                      Updated {format(parseISO(note.updatedAt), 'MMM d, h:mm a')}
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
                      <span className="text-xs text-muted-foreground">{goal.progress}%</span>
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
