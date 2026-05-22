import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import type { CalendarEvent } from "@/types";

export default function CalendarPage() {
  const { tasks, subjects, projects, goals } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar events from all data
  const events = useMemo<CalendarEvent[]>(() => {
    const allEvents: CalendarEvent[] = [];

    // Tasks with task_date
    tasks.forEach((task) => {
      if (task.task_date) {
        if (task.frequency === "daily") {
          // For daily tasks, show on every day from task_date onwards in the visible month
          const taskDate = new Date(task.task_date);
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(currentMonth);

          // Start from either the task's start date or the beginning of visible month, whichever is later
          const startDate = taskDate > monthStart ? taskDate : monthStart;
          const dayCount =
            Math.ceil(
              (monthEnd.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;

          // Add event for each day until end of month
          for (let i = 0; i < dayCount; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);

            if (currentDate > monthEnd) break;

            allEvents.push({
              id: `${task.id}-${currentDate.toISOString().split("T")[0]}`,
              title: task.title,
              date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`,
              type: "task",
              relatedId: task.id,
              color:
                task.status === "completed"
                  ? "#22c55e"
                  : task.priority === "high"
                    ? "#ef4444"
                    : task.priority === "medium"
                      ? "#f59e0b"
                      : "#6b7280",
            });
          }
        } else {
          // One-time tasks - show only on their specific date
          allEvents.push({
            id: task.id,
            title: task.title,
            date: task.task_date,
            type: "task",
            relatedId: task.id,
            color:
              task.status === "completed"
                ? "#22c55e"
                : task.priority === "high"
                  ? "#ef4444"
                  : task.priority === "medium"
                    ? "#f59e0b"
                    : "#6b7280",
          });
        }
      }
    });

    // Subject class schedules - recurring weekly events
    subjects.forEach((subject) => {
      if (subject.timeSlots) {
        subject.timeSlots.forEach((timeSlot) => {
          // Generate class events for the visible month
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(currentMonth);

          // Find all occurrences of this day in the month
          const dayOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].indexOf(timeSlot.day);

          const dayCount =
            Math.ceil(
              (monthEnd.getTime() - monthStart.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;

          for (let i = 0; i < dayCount; i++) {
            const currentDate = new Date(monthStart);
            currentDate.setDate(currentDate.getDate() + i);

            if (currentDate > monthEnd) break;

            if (currentDate.getDay() === dayOfWeek) {
              const classDateTime = new Date(currentDate);
              const [hours, minutes] = timeSlot.startTime
                .split(":")
                .map(Number);
              classDateTime.setHours(hours, minutes, 0, 0);

              allEvents.push({
                id: `${subject.id}-${timeSlot.day}-${currentDate.getTime()}`,
                title: `📚 ${subject.name}`,
                date: classDateTime.toISOString(),
                type: "class",
                relatedId: subject.id,
                color: subject.color,
              });
            }
          }
        });
      }
    });

    // Project deadlines (no milestones in database)
    projects.forEach((project) => {
      if (project.deadline) {
        allEvents.push({
          id: `project-${project.id}`,
          title: `📁 ${project.name}`,
          date: project.deadline,
          type: "deadline",
          relatedId: project.id,
          color: "#8b5cf6",
        });
      }
    });

    // Goals don't have milestones in database, skip

    return allEvents.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [tasks, projects, goals, subjects, currentMonth]);

  // Get days for calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      // Parse date string - handle both ISO datetime and date-only strings
      let eventDate: Date;
      if (event.date.includes("T")) {
        // Full ISO datetime string
        eventDate = parseISO(event.date);
      } else {
        // Date-only string (YYYY-MM-DD) - parse as local date to avoid timezone issues
        const [year, month, day] = event.date.split("-").map(Number);
        eventDate = new Date(year, month - 1, day);
      }
      return isSameDay(eventDate, date);
    });
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View all your deadlines and events
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Calendar Grid */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-24 p-2 rounded-lg text-left transition-colors
                      ${isCurrentMonth ? "bg-card" : "bg-muted/30"}
                      ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted"}
                      ${today ? "bg-primary/5" : ""}
                    `}
                  >
                    <span
                      className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                        ${today ? "bg-primary text-primary-foreground font-bold" : ""}
                        ${!isCurrentMonth ? "text-muted-foreground" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs truncate px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1.5">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="shadow-soft h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d")
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click on a date to see events
              </p>
            ) : selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events on this day
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border"
                    style={{
                      borderColor: `${event.color}40`,
                      backgroundColor: `${event.color}08`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.date.includes("T") && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 opacity-70" />
                            <span className="font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                              {format(parseISO(event.date), "h:mm a")}
                            </span>
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2 text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="shadow-soft">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span className="text-sm">Project Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
              <span className="text-sm">Milestone</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
