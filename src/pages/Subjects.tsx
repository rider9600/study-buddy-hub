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
import { Plus, Trash2, Edit, BookOpen, Clock, User, X } from "lucide-react";
import type { Subject, TimeSlot } from "@/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SUBJECT_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export default function Subjects() {
  const {
    subjects,
    subjectsLoading,
    tasks,
    notes,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    facultyName: "",
    color: SUBJECT_COLORS[0],
    syllabus: "",
    timeSlots: [] as TimeSlot[],
  });

  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      facultyName: "",
      color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      syllabus: "",
      timeSlots: [],
    });
    setNewTimeSlot({
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
    });
    setEditingSubject(null);
  };

  const addTimeSlot = () => {
    if (newTimeSlot.startTime && newTimeSlot.endTime) {
      setFormData({
        ...formData,
        timeSlots: [...formData.timeSlots, { ...newTimeSlot }],
      });
      setNewTimeSlot({
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    try {
      const syllabusArray = formData.syllabus
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: formData.name,
          faculty_name: formData.facultyName || undefined,
          time_slots:
            formData.timeSlots.length > 0 ? formData.timeSlots : undefined,
          color: formData.color,
          syllabus: syllabusArray.length > 0 ? syllabusArray : undefined,
        });
      } else {
        await addSubject({
          name: formData.name,
          faculty_name: formData.facultyName || undefined,
          time_slots:
            formData.timeSlots.length > 0 ? formData.timeSlots : undefined,
          color: formData.color,
          syllabus: syllabusArray.length > 0 ? syllabusArray : undefined,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving subject:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      facultyName: subject.faculty_name || "",
      color: subject.color,
      syllabus: subject.syllabus?.join("\n") || "",
      timeSlots: subject.time_slots || [],
    });
    setIsDialogOpen(true);
  };

  const getSubjectStats = (subjectId: string) => {
    const subjectTasks = tasks.filter((t) => t.subject_id === subjectId);
    const subjectNotes = notes.filter((n) => n.subject_id === subjectId);
    const pendingTasks = subjectTasks.filter((t) => t.status === "pending");

    return {
      totalTasks: subjectTasks.length,
      pendingTasks: pendingTasks.length,
      notes: subjectNotes.length,
    };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground mt-1">
            Organize your courses and study materials
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
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription>
                {editingSubject
                  ? "Update subject details."
                  : "Add a new subject to organize your studies."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics, Physics"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty/Professor</Label>
                <Input
                  id="faculty"
                  placeholder="e.g., Dr. Smith"
                  value={formData.facultyName}
                  onChange={(e) =>
                    setFormData({ ...formData, facultyName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-primary scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base font-semibold">
                  Class Schedule
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add multiple time slots for this course
                </p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <Select
                      value={newTimeSlot.day}
                      onValueChange={(val) =>
                        setNewTimeSlot({
                          ...newTimeSlot,
                          day: val as
                            | "Monday"
                            | "Tuesday"
                            | "Wednesday"
                            | "Thursday"
                            | "Friday"
                            | "Saturday",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newTimeSlot.startTime}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newTimeSlot.endTime}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addTimeSlot}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>

                {/* Display added time slots */}
                {formData.timeSlots.length > 0 && (
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    {formData.timeSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(idx)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="syllabus">Syllabus Topics (one per line)</Label>
                <Textarea
                  id="syllabus"
                  placeholder="Enter syllabus topics, one per line..."
                  value={formData.syllabus}
                  onChange={(e) =>
                    setFormData({ ...formData, syllabus: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingSubject
                    ? "Update Subject"
                    : "Add Subject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Grid */}
      {subjectsLoading ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading subjects...</p>
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No subjects yet. Add your first subject to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const stats = getSubjectStats(subject.id);
            return (
              <Card
                key={subject.id}
                className="shadow-soft hover:shadow-md transition-all cursor-pointer group"
                onClick={() =>
                  setSelectedSubject(
                    selectedSubject?.id === subject.id ? null : subject,
                  )
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(subject);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this subject?",
                            )
                          ) {
                            setIsDeletingId(subject.id);
                            try {
                              await deleteSubject(subject.id);
                            } catch (error) {
                              console.error("Error deleting subject:", error);
                            } finally {
                              setIsDeletingId(null);
                            }
                          }
                        }}
                        disabled={isDeletingId === subject.id}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subject.faculty_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {subject.faculty_name}
                      </div>
                    )}

                    {subject.time_slots && subject.time_slots.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Schedule
                        </p>
                        <div className="space-y-1">
                          {subject.time_slots.map((slot, i) => (
                            <div
                              key={i}
                              className="text-sm text-muted-foreground ml-6"
                            >
                              {slot.day}: {slot.startTime} - {slot.endTime}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {stats.pendingTasks} pending task
                        {stats.pendingTasks !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="secondary">
                        {stats.notes} note{stats.notes !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {/* Expanded view */}
                    {selectedSubject?.id === subject.id &&
                      subject.syllabus &&
                      subject.syllabus.length > 0 && (
                        <div className="pt-3 border-t mt-3 animate-fade-in">
                          <p className="text-sm font-medium mb-2">
                            Syllabus Topics:
                          </p>
                          <ul className="space-y-1">
                            {subject.syllabus.map((topic, i) => (
                              <li
                                key={i}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary">•</span>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
