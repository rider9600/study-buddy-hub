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
import { format, parseISO } from "date-fns";
import {
  Plus,
  Trash2,
  Edit,
  FolderKanban,
  Calendar,
  Users,
} from "lucide-react";
import type { Project } from "@/types";

export default function Projects() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    projectsLoading,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    teamMembers: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      deadline: "",
      teamMembers: "",
    });
    setEditingProject(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const teamMembersArray = formData.teamMembers
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline || undefined,
        team_members:
          teamMembersArray.length > 0 ? teamMembersArray : undefined,
      });
    } else {
      addProject({
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline || undefined,
        team_members:
          teamMembersArray.length > 0 ? teamMembersArray : undefined,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      deadline: project.deadline || "",
      teamMembers: project.team_members?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {projectsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Track your projects and milestones
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
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProject
                      ? "Update project details."
                      : "Start a new project to track your progress."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Final Year Project"
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
                      placeholder="Describe your project..."
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
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">Team Members (comma-separated)</Label>
                    <Input
                      id="team"
                      placeholder="e.g., John, Jane, Bob"
                      value={formData.teamMembers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teamMembers: e.target.value,
                        })
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
                    {editingProject ? "Update Project" : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects List */}
          {projects.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No projects yet. Start your first project!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                return (
                  <Card key={project.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {project.name}
                          </CardTitle>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            {project.deadline && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  parseISO(project.deadline),
                                  "MMM d, yyyy",
                                )}
                              </div>
                            )}
                            {project.team_members &&
                              project.team_members.length > 0 && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  {project.team_members.length} member
                                  {project.team_members.length !== 1 ? "s" : ""}
                                </div>
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
                          onClick={() => handleEdit(project)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {project.team_members &&
                        project.team_members.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-muted-foreground mb-1">
                              Team:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {project.team_members.map((member, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {member}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
