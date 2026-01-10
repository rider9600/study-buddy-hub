import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, Edit, FolderKanban, Calendar, Users } from 'lucide-react';
import type { Project, Milestone } from '@/types';

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('active');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    teamMembers: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      deadline: '',
      teamMembers: '',
    });
    setEditingProject(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const teamMembersArray = formData.teamMembers
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline || undefined,
        teamMembers: teamMembersArray.length > 0 ? teamMembersArray : undefined,
      });
    } else {
      addProject({
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline || undefined,
        status: 'active',
        teamMembers: teamMembersArray.length > 0 ? teamMembersArray : undefined,
        milestones: [],
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      deadline: project.deadline || '',
      teamMembers: project.teamMembers?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const addMilestone = (projectId: string, title: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    updateProject(projectId, {
      milestones: [...project.milestones, newMilestone],
    });
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    updateProject(projectId, {
      milestones: project.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    });
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    updateProject(projectId, {
      milestones: project.milestones.filter(m => m.id !== milestoneId),
    });
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-success/10 text-success';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Track your projects and milestones</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update project details.' : 'Start a new project to track your progress.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Final Year Project"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team Members (comma-separated)</Label>
                <Input
                  id="team"
                  placeholder="e.g., John, Jane, Bob"
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['active', 'completed', 'archived', 'all'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {projects.length === 0 
                ? 'No projects yet. Start your first project!' 
                : 'No projects match this filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const completedMilestones = project.milestones.filter(m => m.completed).length;
            const progress = project.milestones.length > 0
              ? (completedMilestones / project.milestones.length) * 100
              : 0;
            const isExpanded = expandedProject === project.id;

            return (
              <Card key={project.id} className="shadow-soft">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {project.deadline && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(project.deadline), 'MMM d, yyyy')}
                          </div>
                        )}
                        {project.teamMembers && project.teamMembers.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{completedMilestones}/{project.milestones.length} milestones</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardHeader>

                {/* Expanded content */}
                {isExpanded && (
                  <CardContent className="pt-0 animate-fade-in">
                    <div className="border-t pt-4 space-y-4">
                      {/* Status change */}
                      <div className="flex items-center gap-2">
                        <Label>Status:</Label>
                        <Select
                          value={project.status}
                          onValueChange={(value: Project['status']) => 
                            updateProject(project.id, { status: value })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Milestones */}
                      <div>
                        <Label className="mb-2 block">Milestones</Label>
                        <div className="space-y-2">
                          {project.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                            >
                              <Checkbox
                                checked={milestone.completed}
                                onCheckedChange={() => toggleMilestone(project.id, milestone.id)}
                              />
                              <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                {milestone.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => deleteMilestone(project.id, milestone.id)}
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
                                addMilestone(project.id, input.value.trim());
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

                      {/* Team members */}
                      {project.teamMembers && project.teamMembers.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Team Members</Label>
                          <div className="flex flex-wrap gap-2">
                            {project.teamMembers.map((member, i) => (
                              <Badge key={i} variant="secondary">{member}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
