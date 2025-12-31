# Churchill University - Student Application Management System

A comprehensive, production-ready Student Application Management System with three distinct portals: Agent Portal, University Staff Portal, and Student Tracking Portal.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation (ready to integrate)
- **Notifications**: Sonner

### Backend Integration (FastAPI)
This frontend is designed to integrate with a FastAPI backend. All API endpoints are configured in `/lib/api.ts`.

## 📁 Project Structure

```
/
├── App.tsx                          # Main app with routing
├── components/
│   ├── layouts/                     # Portal layouts
│   │   ├── AgentLayout.tsx
│   │   ├── StaffLayout.tsx
│   │   └── StudentLayout.tsx
│   ├── shared/                      # Shared components
│   │   └── ApplicationStatusBadge.tsx
│   └── ui/                          # shadcn/ui components
├── pages/
│   ├── agent/                       # Agent portal pages
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   ├── ApplicationDetail.tsx
│   │   ├── NewApplication.tsx
│   │   └── Reports.tsx
│   ├── staff/                       # Staff portal pages
│   │   ├── Dashboard.tsx
│   │   ├── ApplicationQueue.tsx
│   │   ├── ApplicationReview.tsx
│   │   ├── Interviews.tsx
│   │   └── COEManagement.tsx
│   ├── student/                     # Student tracking pages
│   │   ├── Tracking.tsx
│   │   ├── OfferSigning.tsx
│   │   └── GSForm.tsx
│   └── auth/
│       └── Login.tsx
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── api.ts                       # FastAPI integration layer
│   ├── mockData.ts                  # Mock data for development
│   └── utils.ts                     # Utility functions
└── styles/
    └── globals.css                  # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔗 FastAPI Backend Integration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
```

### API Endpoints

All API calls are centralized in `/lib/api.ts`. The system expects the following FastAPI endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Applications
- `GET /api/applications` - List applications (with filters)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `PATCH /api/applications/:id/status` - Update status
- `GET /api/applications/:id/activities` - Get activities
- `GET /api/applications/track/:trackingId` - Public tracking

#### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/:id/ocr` - Process OCR
- `GET /api/documents/:id` - Get document
- `GET /api/documents/application/:applicationId` - List documents
- `DELETE /api/documents/:id` - Delete document

#### GS Documents
- `POST /api/gs-documents/upload` - Upload GS document
- `GET /api/gs-documents/application/:applicationId` - List GS documents
- `PATCH /api/gs-documents/:id/verify` - Verify document

#### Interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews/:id` - Get interview
- `PATCH /api/interviews/:id/assessment` - Update assessment
- `POST /api/interviews/:id/complete` - Complete interview
- `GET /api/interviews` - List interviews

#### Offers
- `POST /api/offers/generate` - Generate offer letter
- `GET /api/offers/:id` - Get offer
- `GET /api/offers/track/:trackingId` - Get offer by tracking ID (public)
- `POST /api/offers/:id/sign` - Sign offer
- `POST /api/offers/:id/decline` - Decline offer

#### COE
- `POST /api/coe/upload` - Upload COE
- `GET /api/coe/:id` - Get COE
- `GET /api/coe` - List COEs
- `POST /api/coe/:id/send` - Send COE to agent

#### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

#### Dashboard
- `GET /api/dashboard/agent/metrics` - Agent metrics
- `GET /api/dashboard/staff/metrics` - Staff metrics
- `GET /api/dashboard/activities` - Recent activities

#### Reports
- `GET /api/reports/statistics` - Application statistics
- `GET /api/reports/export` - Export applications
- `GET /api/reports/staff-performance` - Staff performance metrics

#### Chat (AI Chatbot)
- `POST /api/chat` - Send chat message
- `GET /api/chat/history/:applicationId` - Get chat history

### FastAPI Backend Example Structure

```python
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Churchill University API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class ApplicationCreate(BaseModel):
    student_name: str
    student_email: str
    student_phone: str
    course: str
    destination: str
    intake: str

# Routes
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Implement authentication logic
    return {"access_token": "token", "token_type": "bearer"}

@app.get("/api/applications")
async def list_applications():
    # Implement application listing
    return {"success": True, "data": []}

@app.post("/api/applications")
async def create_application(application: ApplicationCreate):
    # Implement application creation
    return {"success": True, "data": {}}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🎨 Features Implemented

### Agent Portal
- ✅ Dashboard with metrics and recent activity
- ✅ Application list with filtering and search
- ✅ Detailed application view with tabs
- ✅ Multi-step application creation wizard
- ✅ OCR document upload (UI ready)
- ✅ Reports and analytics (stub)
- ✅ Real-time notifications

### Staff Portal
- ✅ Dashboard with workload metrics
- ✅ Application queue management
- ✅ Application review interface
- ✅ Interview scheduling and management
- ✅ COE upload and distribution
- ✅ Performance tracking

### Student Tracking Portal
- ✅ Public application tracking (no login required)
- ✅ Visual progress timeline
- ✅ Offer letter signing interface
- ✅ GS form completion
- ✅ Document upload portal

### Common Features
- ✅ Role-based authentication
- ✅ Responsive mobile-first design
- ✅ Toast notifications
- ✅ Mock data for development
- ✅ TypeScript type safety
- ✅ Clean component architecture

## 🔄 Features Ready for Backend Integration

The following features have frontend UI ready and need backend implementation:

1. **OCR Document Processing**
   - Upload interface ready in `/pages/agent/NewApplication.tsx`
   - API endpoint: `POST /api/documents/:id/ocr`
   - Expected response: Extracted passport/document data

2. **AI Chatbot**
   - UI components can be added
   - API endpoint: `POST /api/chat`
   - Requires: OpenAI integration with RAG

3. **Offer Letter Generation**
   - Template system needed on backend
   - PDF generation (jsPDF or react-pdf)
   - Digital signature storage

4. **Email Notifications**
   - Backend should send emails via SendGrid/Resend
   - Frontend shows notification center

5. **Real-time Updates**
   - WebSocket or Server-Sent Events
   - Update application status in real-time

6. **File Storage**
   - AWS S3, Cloudflare R2, or similar
   - Secure file upload/download with signed URLs

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Token sent with every API request in `Authorization` header
5. Token refresh mechanism (implement on backend)

## 📱 User Roles

- **Super Admin**: Full system access
- **Staff Admin**: Application review, COE upload, interview scheduling
- **Staff Reviewer**: Application review only
- **Agent**: Submit applications, track status
- **Student**: Track application, sign offers, upload GS documents (no login)

## 🎯 Next Steps for Production

### Backend Development
1. Set up FastAPI with PostgreSQL/MySQL
2. Implement all API endpoints from `/lib/api.ts`
3. Set up OCR service (Azure Computer Vision / Tesseract)
4. Implement file storage (AWS S3)
5. Set up email service (SendGrid/Resend)
6. Implement AI chatbot (OpenAI with RAG)
7. Add authentication & authorization
8. Set up database migrations

### Frontend Enhancement
1. Add React Hook Form to application forms
2. Implement Zod validation schemas
3. Add advanced filtering components
4. Implement real-time chat widget
5. Add PWA support (service workers)
6. Implement offline mode
7. Add analytics tracking

### DevOps
1. Set up CI/CD pipeline (GitHub Actions)
2. Configure environment variables
3. Set up monitoring (Sentry)
4. Configure CDN
5. SSL certificates
6. Database backups
7. Rate limiting

## 📚 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Router Documentation](https://reactrouter.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 🤝 Contributing

This is a production application. Follow these guidelines:

1. Use TypeScript strictly
2. Follow the existing component structure
3. Add proper error handling
4. Write meaningful commit messages
5. Test on mobile devices
6. Ensure accessibility (WCAG 2.1 AA)

## 📄 License

Copyright © 2024 Churchill University. All rights reserved.
