# StudyFlow - Comprehensive Student Management System

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3+-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Core Components](#-core-components)
- [Data Management](#-data-management)
- [Productivity Analytics](#-productivity-analytics)
- [Development Workflow](#-development-workflow)
- [API Documentation](#-api-documentation)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🎯 Project Overview

**StudyFlow** is a comprehensive student management application designed to streamline academic productivity and organization. Built with modern React technologies, it provides an intuitive interface for managing tasks, subjects, projects, notes, and academic schedules.

### Vision

To create an all-in-one academic productivity suite that helps students organize their studies, track progress, and maintain optimal productivity through intelligent analytics and user-friendly interfaces.

### Target Audience

- University students managing multiple subjects
- High school students tracking assignments and schedules
- Academic professionals organizing teaching materials
- Anyone seeking structured academic organization

## ✨ Features

### Core Functionality

#### 📋 Task Management

- **Smart Task Creation**: Create tasks with priority levels (High, Medium, Low)
- **Frequency Options**: One-time or daily recurring tasks
- **Subject Integration**: Link tasks to specific subjects
- **Project Association**: Connect tasks to ongoing projects
- **Goal Tracking**: Align tasks with academic goals
- **Completion Tracking**: Mark tasks complete with timestamp recording
- **Priority-Based Sorting**: Automatic sorting by priority and creation date

#### 📚 Subject Management

- **Comprehensive Subject Profiles**: Name, faculty, syllabus, and color coding
- **Time Slot Management**: Multiple weekly time slots per subject
- **Visual Color System**: Unique colors for easy identification
- **Schedule Integration**: Seamless calendar and timetable integration

#### 📅 Advanced Scheduling

- **Interactive Calendar**: Month view with class schedules and deadlines
- **Smart Timetable**: Transposed layout with days as rows, time slots as columns
- **Recurring Events**: Automatic generation of recurring class schedules
- **Day Detail View**: Click any date to see detailed day information

#### 📝 Note Management

- **Rich Text Notes**: Comprehensive note-taking with formatting
- **Subject Linking**: Associate notes with specific subjects
- **View/Edit Modes**: Separate modes for reading and editing
- **Search Functionality**: Find notes quickly by title or content

#### 📊 Productivity Analytics

- **Weighted Scoring System**:
  - High Priority Tasks: 3x weight
  - Medium Priority Tasks: 2x weight
  - Low Priority Tasks: 1x weight
  - Daily Task Bonus: +50% weight
  - Subject-Linked Bonus: +20% weight
- **Real-Time Calculations**: Live productivity percentage updates
- **Week/Month Views**: Toggle between 7-day and 30-day analytics
- **Interactive Charts**: Click any data point for detailed breakdown
- **Console Debugging**: Detailed calculation explanations in browser console

#### 🎨 User Experience

- **Dark/Light Mode**: System-wide theme toggle with persistence
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Auto-Collapsing Sidebar**: Automatically hides after 4 seconds for space optimization
- **Smooth Animations**: Fade-in effects and smooth transitions
- **Accessibility**: Keyboard navigation and screen reader support

### Advanced Features

#### 🔐 Authentication System

- **Secure Login/Signup**: Form validation and error handling
- **Protected Routes**: Automatic redirection for unauthorized access
- **Context-Based Auth**: React Context for global authentication state
- **Persistent Sessions**: Automatic login state preservation

#### 💾 Data Persistence

- **Local Storage Integration**: Client-side data persistence
- **User-Specific Data**: All data linked to authenticated user
- **Automatic Backups**: Data automatically saved on every change
- **Data Validation**: Input validation and sanitization

#### 📈 Dynamic Analytics

- **Task Completion Tracking**: Historical completion data
- **Subject Progress Monitoring**: Per-subject productivity metrics
- **Goal Achievement Analysis**: Progress toward academic objectives
- **Time-Based Insights**: Performance trends over time

## 🛠 Technology Stack

### Frontend Framework

- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Lightning-fast development server and build tool

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Beautiful, customizable component library
- **Lucide React**: Consistent, customizable icon library

### Data Visualization

- **Recharts**: Composable charting library for React
- **Interactive Charts**: Area charts, pie charts, and bar charts
- **Responsive Visualizations**: Charts adapt to screen size

### State Management

- **React Context**: Global state management for auth and data
- **Custom Hooks**: Reusable stateful logic
- **Local Storage**: Client-side persistence layer

### Development Tools

- **ESLint**: Code linting and style enforcement
- **PostCSS**: CSS processing and optimization
- **Date-fns**: Modern date utility library

## 🏗 Architecture

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   └── common/          # Shared components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── pages/               # Route-level components
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions
└── styles/              # Global styles
```

### Data Flow

1. **User Interaction** → Component Event Handlers
2. **Context Actions** → Data Context Methods
3. **Local Storage** → Persistent Data Layer
4. **State Updates** → Component Re-renders
5. **UI Updates** → User Feedback

### Context Providers

- **AuthContext**: Authentication state and methods
- **DataContext**: Application data and CRUD operations
- **ThemeProvider**: Theme management and persistence

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control

### Step-by-Step Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd study-buddy-hub
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template (if exists)
   cp .env.example .env.local
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Open Application**
   - Navigate to `http://localhost:5173`
   - Create an account or use existing credentials

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Code formatting
npm run format

# Component analysis
npm run analyze
```

## 📖 Usage Guide

### Getting Started

1. **Account Creation**
   - Visit the application URL
   - Click "Sign Up" and create account
   - Verify email (if email verification is enabled)
   - Log in with credentials

2. **Initial Setup**
   - Navigate to Subjects page
   - Add your academic subjects with colors
   - Set up class time slots for each subject
   - Configure recurring schedules

3. **Task Management Workflow**
   - Go to Tasks page
   - Click "Add Task" button
   - Fill in task details:
     - Title (required)
     - Description (optional)
     - Priority level
     - Frequency (once/daily)
     - Subject linking
     - Project association
   - Save and manage tasks

### Daily Usage Patterns

#### Morning Routine

1. Check Dashboard for daily overview
2. Review "Remaining Tasks" section
3. Check today's productivity score
4. Plan day based on task priorities

#### During Study Sessions

1. Use Timetable for schedule reference
2. Take notes in Notes section
3. Mark tasks complete as finished
4. Track progress in real-time

#### Evening Review

1. Check productivity analytics
2. Review completed tasks
3. Plan tomorrow's priorities
4. Update subject progress

### Advanced Features Usage

#### Productivity Analytics

- **Dashboard Charts**: View week/month toggle options
- **Console Debugging**: Click chart points for detailed breakdowns
- **Weight Understanding**: Learn how priority affects scoring
- **Trend Analysis**: Monitor improvement over time

#### Calendar Integration

- **Class Schedules**: Automatically populated from subjects
- **Recurring Events**: Set up weekly class patterns
- **Day Details**: Click dates for specific day information

## 📁 Project Structure

```
study-buddy-hub/
├── public/                    # Static assets
│   ├── robots.txt            # SEO robots file
│   └── favicon.ico           # Application icon
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx   # Button component
│   │   │   ├── card.tsx     # Card component
│   │   │   ├── dialog.tsx   # Modal dialog
│   │   │   └── ...          # Other UI components
│   │   ├── layout/          # Layout components
│   │   │   ├── DashboardLayout.tsx  # Main app layout
│   │   │   └── Sidebar.tsx  # Navigation sidebar
│   │   ├── NavLink.tsx      # Navigation link component
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/            # Context providers
│   │   ├── AuthContext.tsx  # Authentication context
│   │   ├── DataContext.tsx  # Application data context
│   │   └── ThemeProvider.tsx # Theme management
│   ├── hooks/               # Custom hooks
│   │   ├── use-mobile.tsx   # Mobile detection
│   │   ├── use-toast.ts     # Toast notifications
│   │   └── useLocalStorage.ts # Local storage hook
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Route components
│   │   ├── Calendar.tsx     # Calendar view
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Goals.tsx        # Goals management
│   │   ├── Index.tsx        # Landing page
│   │   ├── Login.tsx        # Authentication
│   │   ├── Notes.tsx        # Note management
│   │   ├── NotFound.tsx     # 404 error page
│   │   ├── Projects.tsx     # Project management
│   │   ├── Signup.tsx       # User registration
│   │   ├── Subjects.tsx     # Subject management
│   │   ├── Tasks.tsx        # Task management
│   │   └── Timetable.tsx    # Schedule view
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── components.json          # shadcn/ui configuration
├── eslint.config.js        # ESLint configuration
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App TypeScript config
├── tsconfig.node.json      # Node TypeScript config
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🧩 Core Components

### Context Providers

#### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

#### DataContext

```typescript
interface DataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Subjects, Notes, Projects, Goals...
  // Similar CRUD operations for each entity
}
```

### Key Components

#### Dashboard.tsx

- **Purpose**: Main application dashboard
- **Features**: Analytics charts, task overview, productivity metrics
- **Key Functions**:
  - `productivityData`: Calculates weighted productivity scores
  - `logProductivityBreakdown`: Debug function for chart analysis
  - Chart click handlers for detailed insights

#### Tasks.tsx

- **Purpose**: Task management interface
- **Features**: CRUD operations, filtering, priority management
- **Key Functions**:
  - `handleSubmit`: Task creation/editing
  - `filteredTasks`: Task filtering and sorting
  - Priority-based visual indicators

#### Subjects.tsx

- **Purpose**: Subject and schedule management
- **Features**: Time slot management, color coding, faculty information
- **Key Functions**:
  - `handleAddTimeSlot`: Time slot creation
  - `handleRemoveTimeSlot`: Time slot deletion
  - Color picker integration

## 💾 Data Management

### Data Models

#### Task Interface

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  frequency?: "once" | "daily";
  subjectId?: string;
  projectId?: string;
  goalId?: string;
  createdAt: string;
  completedAt?: string;
}
```

#### Subject Interface

```typescript
interface Subject {
  id: string;
  name: string;
  facultyName?: string;
  timeSlots?: TimeSlot[];
  color: string;
  syllabus?: string[];
  createdAt: string;
  userId?: string;
}
```

#### TimeSlot Interface

```typescript
interface TimeSlot {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}
```

### Local Storage Strategy

#### Data Keys

- `studyflow_user`: Current user information
- `studyflow_tasks_${userId}`: User-specific tasks
- `studyflow_subjects_${userId}`: User-specific subjects
- `studyflow_notes_${userId}`: User-specific notes
- `studyflow_projects_${userId}`: User-specific projects
- `studyflow_goals_${userId}`: User-specific goals

#### Data Synchronization

- Automatic save on every data change
- User-specific data isolation
- Conflict resolution strategies
- Data validation before storage

## 📊 Productivity Analytics

### Weighted Scoring System

#### Base Weights

- **High Priority**: 3.0x multiplier
- **Medium Priority**: 2.0x multiplier
- **Low Priority**: 1.0x multiplier (baseline)

#### Bonus Multipliers

- **Daily Tasks**: +50% (+1.5x)
- **Subject-Linked**: +20% (+1.2x)

#### Calculation Formula

```typescript
const taskWeight = basePriority * frequencyMultiplier * subjectMultiplier;
const productivity = (completedWeight / totalWeight) * 100;
```

#### Example Calculation

```
High Priority Daily Subject Task:
Base: 3.0 × Daily: 1.5 × Subject: 1.2 = 5.4 total weight

If completed: 5.4/5.4 = 100%
If pending: 0/5.4 = 0%
```

### Chart Features

- **Interactive Data Points**: Click for detailed breakdown
- **Console Logging**: Complete calculation transparency
- **Week/Month Toggle**: Flexible time period analysis
- **Real-time Updates**: Live productivity tracking

## 🔄 Development Workflow

### Code Standards

#### TypeScript Guidelines

- Strict type checking enabled
- Interface definitions for all data structures
- Generic types for reusable components
- Proper error handling with typed exceptions

#### Component Patterns

```typescript
// Functional component with TypeScript
interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
}

export const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Component logic
};
```

#### Custom Hooks

```typescript
// Reusable stateful logic
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Hook implementation
};
```

### Git Workflow

1. **Feature Branches**: Create feature-specific branches
2. **Commit Messages**: Follow conventional commit format
3. **Code Reviews**: Review all changes before merging
4. **Testing**: Ensure functionality before deployment

### Performance Optimization

- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large data lists
- **Bundle Analysis**: Regular bundle size monitoring

## 📚 API Documentation

### Context API Methods

#### AuthContext Methods

```typescript
// User authentication
login(email: string, password: string): Promise<void>
signup(email: string, password: string, name: string): Promise<void>
logout(): void
```

#### DataContext Methods

```typescript
// Task operations
addTask(task: Omit<Task, 'id' | 'createdAt'>): void
updateTask(id: string, updates: Partial<Task>): void
deleteTask(id: string): void
completeTask(id: string): void

// Subject operations
addSubject(subject: Omit<Subject, 'id' | 'createdAt'>): void
updateSubject(id: string, updates: Partial<Subject>): void
deleteSubject(id: string): void

// Note operations
addNote(note: Omit<Note, 'id' | 'createdAt'>): void
updateNote(id: string, updates: Partial<Note>): void
deleteNote(id: string): void
```

### Utility Functions

#### Date Utilities

```typescript
// Format dates for display
formatDate(date: Date): string

// Parse ISO strings
parseISODate(isoString: string): Date

// Check date relationships
isToday(date: Date): boolean
isPast(date: Date): boolean
```

#### Storage Utilities

```typescript
// Local storage helpers
getStorageItem<T>(key: string): T | null
setStorageItem<T>(key: string, value: T): void
removeStorageItem(key: string): void
```

## 🚧 Future Enhancements

### Backend Integration

- **Database**: Supabase PostgreSQL with row-level security
- **Real-time Sync**: Live data synchronization across devices
- **Cloud Storage**: File attachments for notes and projects
- **Backup & Restore**: Automated cloud backups

### Advanced Features

- **Collaboration**: Shared study groups and projects
- **AI Integration**: Smart task prioritization and study recommendations
- **Mobile App**: React Native cross-platform mobile version
- **Offline Mode**: Progressive Web App with offline functionality

### Analytics Enhancements

- **Machine Learning**: Predictive productivity insights
- **Goal Tracking**: Advanced goal achievement analytics
- **Study Patterns**: Learning behavior analysis
- **Performance Trends**: Long-term academic performance tracking

### Integration Possibilities

- **Calendar Sync**: Google Calendar, Outlook integration
- **LMS Integration**: Canvas, Moodle, Blackboard connectivity
- **Note Taking**: Notion, Obsidian synchronization
- **Task Management**: Todoist, Asana integration

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and patterns
- Add TypeScript types for all new code
- Include tests for new functionality
- Update documentation for API changes
- Ensure accessibility compliance

### Code Review Process

- All changes require review approval
- Automated tests must pass
- No direct pushes to main branch
- Constructive feedback encouraged

## 🔧 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### TypeScript Errors

```bash
# Run type checking
npm run type-check

# Common fixes
- Check import statements
- Verify interface definitions
- Update component prop types
```

#### Performance Issues

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for memory leaks
- Monitor component unmounting
- Clear event listeners
- Optimize re-renders
```

#### Data Persistence Issues

- Check browser local storage
- Verify user authentication state
- Clear storage and re-login if needed
- Check console for storage errors

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem("studyflow_debug", "true");
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team**: For the amazing framework
- **Radix UI**: For accessible component primitives
- **shadcn/ui**: For beautiful, customizable components
- **Tailwind CSS**: For utility-first styling
- **Lucide**: For consistent icons
- **Recharts**: For powerful data visualization
- **Date-fns**: For modern date utilities

---

**Built with ❤️ for students, by developers who understand the academic struggle.**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/rider9600/study-buddy-hub).

---

_Last updated: January 2026_
