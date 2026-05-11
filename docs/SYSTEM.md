# Student Application Portal - Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [User Roles & Workflows](#user-roles--workflows)
6. [Application Stages](#application-stages)
7. [State Management](#state-management)
8. [API Services](#api-services)
9. [Routing & Navigation](#routing--navigation)
10. [Configuration](#configuration)
11. [Development Guidelines](#development-guidelines)

---

## Project Overview

**Project Name:** Churchill Application Portal (Student Application Management System)

**Purpose:** A comprehensive web application for managing student course applications through their entire lifecycle - from initial submission to enrollment completion.

**Core Users:**
- Students submitting course applications
- Agents managing student applications on their behalf
- Staff reviewing and processing applications
- Administrators overseeing the system

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.0.10 (App Router) |
| Language | TypeScript 5.x |
| UI Library | Radix UI (shadcn/ui components) |
| Styling | Tailwind CSS 4.1.17 |
| Forms | React Hook Form + Zod |
| Server State | TanStack React Query 5.x |
| Client State | Zustand 5.x |
| URL State | nuqs 2.x |
| Authentication | NextAuth.js 4.x |
| Data Visualization | Recharts, FullCalendar |
| Drag & Drop | @dnd-kit |
| PDF Generation | @react-pdf/renderer |
| Package Manager | pnpm |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # Authenticated dashboard
│   ├── student/           # Student portal
│   ├── track/             # Public tracking
│   └── ...
│
├── features/              # Domain-driven feature modules
│   ├── application-detail/
│   ├── application-form/
│   ├── application-list/
│   ├── auth/
│   ├── dashboard/
│   ├── gs/
│   ├── gs-interviews/
│   ├── notifications/
│   ├── student-application/
│   └── threads/
│
├── shared/                # Cross-feature shared code
│   ├── components/ui/     # shadcn/ui components
│   ├── config/           # Application config
│   ├── constants/        # Enums, constants
│   ├── data/             # Static data
│   ├── hooks/            # Shared hooks
│   ├── lib/              # Utilities
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── validation/       # Zod schemas
│
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── forms/           # Form components
│   ├── data-table/      # Data table components
│   └── shared/          # Shared components
│
├── hooks/               # Global hooks
└── service/             # API service layer
```

---

## Key Features

### Authentication & Authorization
- Email/password login
- Microsoft OAuth integration
- Role-based access control (Student, Agent, Staff, Admin)
- JWT token management with refresh
- Multi-Factor Authentication (MFA) support

### Application Management
- Multi-step application form wizard
- Document upload (passport, transcripts, English test scores)
- Application status tracking
- Stage-based workflow management

### Document Management
- Drag-and-drop file upload
- Document categorization (passport, transcripts, English test, GS docs)
- COE (Confirmation of Enrollment) management

### GS Assessment
- GS (Genuine Student) screening form
- Financial document upload
- Interview scheduling with FullCalendar

### Dashboard & Analytics
- Role-based dashboards (Staff, Agent)
- KPI charts using Recharts
- Application status visualization
- Workload management

### Communication
- Application threads/messaging
- Task management
- Real-time notifications

---

## User Roles & Workflows

### Student
1. Register and login
2. Fill out course application form
3. Upload required documents
4. Track application status
5. View and sign offer letter
6. Submit GS assessment

### Agent
1. Create student applications
2. Submit applications on behalf of students
3. Upload supporting documents
4. Track application progress

### Staff
1. Review submitted applications
2. Generate offer letters (PDF)
3. Manage application stages
4. Schedule GS interviews
5. Issue COE

### Admin
1. System administration
2. Staff management
3. System configuration

---

## Application Stages

The application lifecycle follows these stages:

```
DRAFT → SUBMITTED → STAFF_REVIEW → OFFER_GENERATED → GS_ASSESSMENT → COE → COMPLETED/REJECTED
```

| Stage | Description |
|-------|-------------|
| Draft | Application being created |
| Submitted | Application submitted by agent/student |
| Staff Review | Under staff assessment |
| Offer Generated | Offer letter generated |
| GS Assessment | Genuine Student assessment in progress |
| COE | Confirmation of Enrollment issued |
| Completed | Application accepted |
| Rejected | Application rejected |

**Important:** Use `src/shared/config/application-stage.config.ts` as the single source of truth for stage metadata. Do not redefine stage labels, colors, or icons in feature files.

---

## State Management

### Server State (TanStack React Query)
- API data fetching
- Caching and invalidation
- Background refetching

### Client State (Zustand)
- `usePaginationStore` - Pagination state
- `useApplicationStepStore` - Form step navigation (persisted to localStorage)
- `useApplicationFormDataStore` - Form data (persisted to localStorage)
- `usePublicStudentApplicationStore` - Public application state

### URL State (nuqs)
- Query string parameters
- Type-safe URL state management

### Auth State (NextAuth)
- Session management via `useSession`
- JWT token handling

---

## API Services

Services are located in `src/service/`:

| Service | Purpose |
|---------|---------|
| `application.service.ts` | Application CRUD, submit, approve, reject |
| `auth.service.ts` | Login, register, token refresh, OAuth |
| `student.service.ts` | Student profile management |
| `document.service.ts` | Document upload/download |
| `course.service.ts` | Course/intake data |
| `gs-assessment.service.ts` | GS assessment data |
| `gs-meetings.service.ts` | GS meeting scheduling |
| `dashboard.service.ts` | Dashboard metrics |
| `application-threads.service.ts` | Communication threads |
| `staff-members.service.ts` | Staff management |
| `galaxy-sync.service.ts` | Galaxy ERP integration |

---

## Routing & Navigation

### Authentication Routes
- `/login` - Main login page
- `/login/staff` - Staff-specific login
- `/login/admin` - Admin login
- `/register` - Registration
- `/forgot-password` - Password reset

### Dashboard Routes (Authenticated)
- `/dashboard` - Main dashboard
- `/dashboard/application` - Application list/kanban
- `/dashboard/application/[id]` - Application detail
- `/dashboard/tasks` - Task management
- `/dashboard/notifications` - Notification center
- `/dashboard/gs-interviews` - GS interview calendar

### Student Portal
- `/student` - Student home
- `/student/manage-application` - Application form
- `/track` - Public tracking
- `/track/gs-form/[trackingId]` - GS form submission

### API Routes
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/galaxy-sync/[applicationId]` - Galaxy sync
- `/api/google-places/*` - Google Places proxy

---

## Configuration

### Key Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript paths |
| `components.json` | shadcn/ui registry |
| `knip.json` | Unused code detection |

### Environment Variables
- `API_PROXY_TARGET` / `NEXT_PUBLIC_API_PROXY_TARGET` - Backend API proxy

### Image Domains
- churchilltest.blob.core.windows.net
- churchillapplicationportal.s3.amazonaws.com
- churchillapplicationportal.s3.ap-southeast-2.amazonaws.com

---

## Development Guidelines

### Route Helpers
Use canonical route helpers from `site-routes.ts`:
```typescript
siteRoutes.dashboard.application.id.details(id)
siteRoutes.dashboard.application.id.documents(id)
siteRoutes.dashboard.application.id.gs(id)
```

### UUID Validation
Every application detail route must:
1. Accept `params: Promise<{ id: string }>`
2. Call `ensureValidApplicationId(id)` before rendering

### UI Composition
Use `cn` from `@/shared/lib/utils` for className composition:
```typescript
import { cn } from "@/shared/lib/utils"
<div className={cn("base-class", condition && "conditional-class")} />
```

### Stage Configuration
All stage metadata must use `src/shared/config/application-stage.config.ts`:
- Labels: `getStageLabel(stage)`, `getRoleStageLabel(stage, role)`
- Colors: `getStageKanbanColor(stage)`, `getStageKanbanBackground(stage)`
- Icons: `getStageIcon(stage)`
- Pills: `STAGE_PILL_CONFIG[stage]`

---

## Testing

No test framework is currently configured. The `knip.json` excludes test files from linting.

---

## Docker

The project includes Docker configuration:
- `Dockerfile` - Docker image build
- `docker-compose.yml` - Docker compose setup