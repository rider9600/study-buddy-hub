import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Trash2,
  Edit,
  Target,
  Sparkles,
  BookOpen,
  Zap,
  MoreHorizontal,
} from "lucide-react";
import type { Goal } from "@/types";

const CATEGORY_ICONS = {
  skill: Zap,
  habit: Sparkles,
  learning: BookOpen,
  other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  skill:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  habit: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  learning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, goalsLoading } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "skill" as Goal["category"],
    duration: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "skill",
      duration: "",
    });
    setEditingGoal(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        duration: formData.duration || undefined,
      });
    } else {
      addGoal({
        title: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        duration: formData.duration || undefined,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.title,
      description: goal.description || "",
      category: goal.category || "skill",
      duration: goal.duration || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {goalsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Self-Improvement Goals</h1>
              <p className="text-muted-foreground mt-1">
                Track your personal growth and habits
              </p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? "Edit Goal" : "Set a New Goal"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGoal
                      ? "Update your goal details."
                      : "Define a personal goal to track your progress."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Goal Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Learn a new language"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your goal..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: Goal["category"]) =>
                        setFormData({ ...formData, category: value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingGoal ? "Update Goal" : "Create Goal"}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const Icon = CATEGORY_ICONS[goal.category || "other"];

                return (
                  <Card key={goal.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`p-2 rounded-lg ${CATEGORY_COLORS[goal.category || "other"]}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-lg">
                              {goal.title}
                            </CardTitle>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge
                              variant="outline"
                              className={
                                CATEGORY_COLORS[goal.category || "other"]
                              }
                            >
                              {goal.category || "other"}
                            </Badge>
                            {goal.duration && (
                              <Badge variant="secondary">{goal.duration}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
