import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
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
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Edit, FileText, Search, X } from "lucide-react";
import type { Note } from "@/types";

export default function Notes() {
  const { notes, subjects, projects, goals, addNote, updateNote, deleteNote } =
    useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subjectId: "none",
    projectId: "none",
    goalId: "none",
    tags: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      subjectId: "none",
      projectId: "none",
      goalId: "none",
      tags: "",
    });
    setEditingNote(null);
  };

  const handleSubmit = () => {
    console.log("Notes handleSubmit called with formData:", formData);

    // Require content
    if (!formData.content.trim()) {
      console.warn("Note content is empty, aborting submit");
      alert("Please add some content to your note");
      return;
    }

    // Generate title from content if not provided
    let title = formData.title.trim();
    if (!title) {
      // Take first 50 characters of content as title
      title = formData.content.trim().substring(0, 50);
      if (formData.content.length > 50) {
        title += "...";
      }
      // If content is very short, use "Untitled Note"
      if (title.length < 3) {
        title = "Untitled Note";
      }
    }

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingNote) {
        console.log("Updating existing note:", editingNote.id);
        updateNote(editingNote.id, {
          title: title,
          content: formData.content,
          subject_id:
            formData.subjectId === "none" ? undefined : formData.subjectId,
          project_id:
            formData.projectId === "none" ? undefined : formData.projectId,
          tags: tagsArray,
        });
      } else {
        console.log("Creating new note");
        addNote({
          title: title,
          content: formData.content,
          subject_id:
            formData.subjectId === "none" ? undefined : formData.subjectId,
          project_id:
            formData.projectId === "none" ? undefined : formData.projectId,
          tags: tagsArray,
        });
      }

      console.log("Note operation successful, closing dialog");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subjectId: note.subject_id || "none",
      projectId: note.project_id || "none",
      goalId: "none",
      tags: note.tags.join(", "),
    });
    setIsDialogOpen(true);
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
    setIsViewDialogOpen(true);
  };

  const openEditFromView = () => {
    if (viewingNote) {
      setIsViewDialogOpen(false);
      handleEdit(viewingNote);
    }
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesSubject =
        filterSubject === "all" || note.subject_id === filterSubject;

      return matchesSearch && matchesSubject;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-1">
            Create and organize your study notes
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            console.log("Notes dialog open state changed:", open);
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                console.log("Add Notes button clicked");
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Notes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Note" : "Create New Note"}
              </DialogTitle>
              <DialogDescription>
                {editingNote
                  ? "Update your note."
                  : "Create a new note for your studies."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Note title (leave empty for auto-generated title)"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Start writing your notes... (this is required)"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Supports markdown formatting: **bold**, *italic*, - lists, #
                  headings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subjectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
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
                  <Label>Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, projectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., exam, important, chapter-1"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Note View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{viewingNote?.title}</DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditFromView}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {viewingNote?.content && (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg border">
                    {viewingNote.content}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {viewingNote?.subject_id &&
                  subjects.find((s) => s.id === viewingNote.subject_id) && (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${subjects.find((s) => s.id === viewingNote.subject_id)?.color}20`,
                        color: subjects.find(
                          (s) => s.id === viewingNote.subject_id,
                        )?.color,
                      }}
                    >
                      {
                        subjects.find((s) => s.id === viewingNote.subject_id)
                          ?.name
                      }
                    </Badge>
                  )}
                {viewingNote?.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Created:{" "}
                {viewingNote && format(parseISO(viewingNote.created_at), "PPp")}
                {/* Note: No update timestamp in current schema */}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {notes.length === 0
                ? "No notes yet. Start taking notes!"
                : "No notes match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="shadow-soft hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleView(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium truncate flex-1">{note.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {note.content || "No content"}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {note.subject_id &&
                    subjects.find((s) => s.id === note.subject_id) && (
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${subjects.find((s) => s.id === note.subject_id)?.color}20`,
                          color: subjects.find((s) => s.id === note.subject_id)
                            ?.color,
                        }}
                      >
                        {subjects.find((s) => s.id === note.subject_id)?.name}
                      </Badge>
                    )}
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Created {format(parseISO(note.created_at), "MMM d, h:mm a")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
