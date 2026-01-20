import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  BookMarked,
  FileText,
  Calendar,
  Clock,
  FolderKanban,
  Target,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/subjects", icon: BookMarked, label: "Subjects" },
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/timetable", icon: Clock, label: "Timetable" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/goals", icon: Target, label: "Self-Improvement" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const autoCollapseTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse functionality
  useEffect(() => {
    if (!isCollapsed) {
      // Clear any existing timer
      if (autoCollapseTimer.current) {
        clearTimeout(autoCollapseTimer.current);
      }

      // Set a new timer to auto-collapse after 4 seconds
      autoCollapseTimer.current = setTimeout(() => {
        setIsCollapsed(true);
      }, 4000);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoCollapseTimer.current) {
        clearTimeout(autoCollapseTimer.current);
      }
    };
  }, [isCollapsed]);

  const handleToggleCollapse = () => {
    // Clear the timer when user manually toggles
    if (autoCollapseTimer.current) {
      clearTimeout(autoCollapseTimer.current);
      autoCollapseTimer.current = null;
    }
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              StudyFlow
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="h-8 w-8 shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start gap-3 px-3",
            isCollapsed && "justify-center px-0",
          )}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3",
            isCollapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>

        {!isCollapsed && user && (
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
