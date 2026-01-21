import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import type { TimeSlot } from "@/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ScheduleSlot {
  subject: { id: string; name: string; color: string };
  timeSlot: TimeSlot;
}

export default function Timetable() {
  const { subjects } = useData();

  // Build weekly schedule
  const weeklySchedule = useMemo(() => {
    const schedule: Record<string, ScheduleSlot[]> = {};

    DAYS.forEach((day) => {
      schedule[day] = [];
    });

    // Populate schedule with subject time slots
    subjects.forEach((subject) => {
      if (subject.time_slots) {
        subject.time_slots.forEach((slot) => {
          schedule[slot.day].push({
            subject: {
              id: subject.id,
              name: subject.name,
              color: subject.color,
            },
            timeSlot: slot,
          });
        });
      }
    });

    // Sort time slots by start time for each day
    Object.keys(schedule).forEach((day) => {
      schedule[day].sort((a, b) =>
        a.timeSlot.startTime.localeCompare(b.timeSlot.startTime),
      );
    });

    return schedule;
  }, [subjects]);

  // Get all unique times for the column headers
  const allTimes = useMemo(() => {
    const times = new Set<string>();
    subjects.forEach((subject) => {
      if (subject.time_slots) {
        subject.time_slots.forEach((slot) => {
          times.add(slot.startTime);
          times.add(slot.endTime);
        });
      }
    });
    return Array.from(times).sort();
  }, [subjects]);

  const hasSchedules = subjects.some(
    (s) => s.time_slots && s.time_slots.length > 0,
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Class Timetable</h1>
        <p className="text-muted-foreground mt-1">Your weekly class schedule</p>
      </div>

      {!hasSchedules ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No class schedule added yet. Add time slots to your subjects to
              see your timetable.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Day View Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day) => (
              <Card key={day} className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklySchedule[day].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {weeklySchedule[day].map((slot, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border-l-4 bg-muted/50"
                          style={{ borderColor: slot.subject.color }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {slot.subject.name}
                              </h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {slot.timeSlot.startTime} -{" "}
                                {slot.timeSlot.endTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table View for better overview */}
          {allTimes.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold min-w-24">
                        Day
                      </th>
                      {allTimes.map((time) => (
                        <th
                          key={time}
                          className="text-left p-2 font-semibold min-w-20 text-xs"
                        >
                          {time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr
                        key={day}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-2 font-medium text-muted-foreground">
                          {day}
                        </td>
                        {allTimes.map((time) => {
                          const classAtTime = weeklySchedule[day].find(
                            (slot) =>
                              slot.timeSlot.startTime <= time &&
                              time < slot.timeSlot.endTime,
                          );

                          return (
                            <td
                              key={`${day}-${time}`}
                              className="p-2"
                              style={{
                                backgroundColor: classAtTime
                                  ? `${classAtTime.subject.color}20`
                                  : "transparent",
                              }}
                            >
                              {classAtTime && (
                                <div className="text-xs font-medium truncate">
                                  {classAtTime.subject.name}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Subject Legend */}
          {subjects.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subject Legend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-sm">{subject.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
