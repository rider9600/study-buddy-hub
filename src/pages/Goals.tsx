import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit, Target, Sparkles, BookOpen, Zap, MoreHorizontal } from 'lucide-react';
import type { Goal, Milestone } from '@/types';

const CATEGORY_ICONS = {
  skill: Zap,
  habit: Sparkles,
  learning: BookOpen,
  other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  skill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  habit: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  learning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'skill' as Goal['category'],
    duration: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'skill',
      duration: '',
    });
    setEditingGoal(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        duration: formData.duration || undefined,
      });
    } else {
      addGoal({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        duration: formData.duration || undefined,
        progress: 0,
        milestones: [],
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      category: goal.category,
      duration: goal.duration || '',
    });
    setIsDialogOpen(true);
  };

  const addMilestone = (goalId: string, title: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    updateGoal(goalId, {
      milestones: [...goal.milestones, newMilestone],
    });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    // Auto-update progress based on milestones
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = updatedMilestones.length > 0
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : goal.progress;

    updateGoal(goalId, {
      milestones: updatedMilestones,
      progress,
    });
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    updateGoal(goalId, {
      milestones: goal.milestones.filter(m => m.id !== milestoneId),
    });
  };

  const updateProgress = (goalId: string, progress: number) => {
    updateGoal(goalId, { progress });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Self-Improvement Goals</h1>
          <p className="text-muted-foreground mt-1">Track your personal growth and habits</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Set a New Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update your goal details.' : 'Define a personal goal to track your progress.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Learn a new language"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Goal['category']) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill Development</SelectItem>
                    <SelectItem value="habit">Habit Formation</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (optional)</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 30 days, 3 months"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No goals set yet. Set your first personal goal!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = CATEGORY_ICONS[goal.category];
            const isExpanded = expandedGoal === goal.id;

            return (
              <Card key={goal.id} className="shadow-soft">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[goal.category]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className={CATEGORY_COLORS[goal.category]}>
                          {goal.category}
                        </Badge>
                        {goal.duration && (
                          <Badge variant="secondary">{goal.duration}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(goal);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardHeader>

                {/* Expanded content */}
                {isExpanded && (
                  <CardContent className="pt-0 animate-fade-in">
                    <div className="border-t pt-4 space-y-4">
                      {/* Manual progress slider */}
                      <div className="space-y-2">
                        <Label>Update Progress</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[goal.progress]}
                            onValueChange={([value]) => updateProgress(goal.id, value)}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12 text-right">{goal.progress}%</span>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div>
                        <Label className="mb-2 block">Milestones</Label>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                            >
                              <Checkbox
                                checked={milestone.completed}
                                onCheckedChange={() => toggleMilestone(goal.id, milestone.id)}
                              />
                              <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                {milestone.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => deleteMilestone(goal.id, milestone.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}

                          {/* Add milestone */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const input = e.currentTarget.querySelector('input');
                              if (input && input.value.trim()) {
                                addMilestone(goal.id, input.value.trim());
                                input.value = '';
                              }
                            }}
                            className="flex gap-2"
                          >
                            <Input placeholder="Add a milestone..." className="flex-1" />
                            <Button type="submit" size="sm">Add</Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
