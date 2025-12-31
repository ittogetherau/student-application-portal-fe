# FastAPI Backend Integration Guide

This document provides detailed guidance for integrating this React frontend with a FastAPI backend.

## Quick Start

### 1. FastAPI Project Setup

```bash
# Create FastAPI project
mkdir churchill-api
cd churchill-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib bcrypt python-multipart
```

### 2. Project Structure

```
churchill-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── database.py             # Database configuration
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── application.py
│   │   ├── document.py
│   │   └── interview.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── application.py
│   │   └── document.py
│   ├── routers/                # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── applications.py
│   │   ├── documents.py
│   │   ├── interviews.py
│   │   └── dashboard.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── ocr_service.py
│   │   ├── email_service.py
│   │   └── storage_service.py
│   └── core/                   # Core configuration
│       ├── __init__.py
│       ├── config.py
│       └── security.py
├── alembic/                    # Database migrations
├── requirements.txt
└── .env
```

## Database Models

### User Model (SQLAlchemy)

```python
# app/models/user.py
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    STAFF_ADMIN = "staff_admin"
    STAFF_REVIEWER = "staff_reviewer"
    AGENT = "agent"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    agent_id = Column(String, nullable=True)
    staff_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Application Model

```python
# app/models/application.py
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    OFFER_SENT = "offer_sent"
    OFFER_ACCEPTED = "offer_accepted"
    GS_DOCUMENTS_PENDING = "gs_documents_pending"
    GS_INTERVIEW_SCHEDULED = "gs_interview_scheduled"
    GS_APPROVED = "gs_approved"
    FEE_PAYMENT_PENDING = "fee_payment_pending"
    COE_ISSUED = "coe_issued"
    REJECTED = "rejected"

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    reference_number = Column(String, unique=True, index=True)
    agent_id = Column(String, ForeignKey("users.id"))
    student_name = Column(String, nullable=False)
    student_email = Column(String, nullable=False)
    student_phone = Column(String, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    current_stage = Column(String, nullable=False)
    assigned_staff_id = Column(String, ForeignKey("users.id"), nullable=True)
    destination = Column(String, nullable=False)
    course = Column(String, nullable=False)
    intake = Column(String, nullable=False)
    passport_data = Column(JSON, nullable=True)
    english_test_data = Column(JSON, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    documents = relationship("Document", back_populates="application")
    activities = relationship("Activity", back_populates="application")
```

## Pydantic Schemas

### Application Schemas

```python
# app/schemas/application.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    # ... other statuses

class PassportData(BaseModel):
    passport_number: str
    first_name: str
    last_name: str
    date_of_birth: str
    nationality: str
    issue_date: str
    expiry_date: str
    place_of_birth: str
    confidence: Optional[float] = None

class ApplicationCreate(BaseModel):
    student_name: str
    student_email: EmailStr
    student_phone: str
    destination: str
    course: str
    intake: str

class ApplicationResponse(BaseModel):
    id: str
    reference_number: str
    agent_id: str
    student_name: str
    student_email: str
    status: ApplicationStatus
    destination: str
    course: str
    intake: str
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## API Routes Implementation

### Authentication Router

```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, Token

router = APIRouter(prefix="/api/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # Decode token and get user
    # Implementation depends on your JWT setup
    pass
```

### Applications Router

```python
# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.core.security import get_current_user
import uuid

router = APIRouter(prefix="/api/applications", tags=["applications"])

@router.get("/", response_model=List[ApplicationResponse])
async def list_applications(
    status: Optional[str] = None,
    search_query: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Application)
    
    # Filter by agent if user is agent
    if current_user.role == "agent":
        query = query.filter(Application.agent_id == current_user.id)
    
    # Filter by assigned staff if user is staff
    elif current_user.role in ["staff_admin", "staff_reviewer"]:
        query = query.filter(Application.assigned_staff_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Application.status == status)
    
    if search_query:
        query = query.filter(
            (Application.student_name.ilike(f"%{search_query}%")) |
            (Application.reference_number.ilike(f"%{search_query}%"))
        )
    
    applications = query.offset(skip).limit(limit).all()
    return applications

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Generate reference number
    ref_number = f"CHU-2024-{str(uuid.uuid4())[:8].upper()}"
    
    new_application = Application(
        id=str(uuid.uuid4()),
        reference_number=ref_number,
        agent_id=current_user.id,
        **application.dict(),
        current_stage="initial_review"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    # Send notification email
    # await email_service.send_application_received(new_application)
    
    return new_application

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if current_user.role == "agent" and application.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return application

@router.get("/track/{tracking_id}")
async def track_application(
    tracking_id: str,
    db: Session = Depends(get_db)
):
    """Public endpoint for student tracking"""
    application = db.query(Application).filter(
        Application.reference_number == tracking_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Return limited information for students
    return {
        "reference_number": application.reference_number,
        "student_name": application.student_name,
        "status": application.status,
        "current_stage": application.current_stage,
        "course": application.course,
        "destination": application.destination,
        "submitted_at": application.submitted_at,
        "updated_at": application.updated_at
    }
```

### Document Upload with OCR

```python
# app/routers/documents.py
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ocr_service import OCRService
from app.services.storage_service import StorageService
import uuid

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    application_id: str = Form(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate file
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Upload to S3/storage
    storage_service = StorageService()
    file_url = await storage_service.upload(file, f"documents/{application_id}")
    
    # Create document record
    document = Document(
        id=str(uuid.uuid4()),
        application_id=application_id,
        type=document_type,
        file_name=file.filename,
        file_url=file_url,
        file_size=file.size,
        uploaded_by=current_user.id
    )
    
    db.add(document)
    db.commit()
    
    return {"id": document.id, "file_url": file_url}

@router.post("/{document_id}/ocr")
async def process_ocr(
    document_id: str,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Process with OCR
    ocr_service = OCRService()
    extracted_data = await ocr_service.extract_passport_data(document.file_url)
    
    # Update document with OCR data
    document.ocr_data = extracted_data
    db.commit()
    
    return extracted_data
```

## Services Implementation

### OCR Service (Azure Computer Vision)

```python
# app/services/ocr_service.py
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
from app.core.config import settings
import time

class OCRService:
    def __init__(self):
        self.client = ComputerVisionClient(
            settings.AZURE_COMPUTER_VISION_ENDPOINT,
            CognitiveServicesCredentials(settings.AZURE_COMPUTER_VISION_KEY)
        )
    
    async def extract_passport_data(self, image_url: str):
        # Read text from image
        read_response = self.client.read(image_url, raw=True)
        read_operation_location = read_response.headers["Operation-Location"]
        operation_id = read_operation_location.split("/")[-1]
        
        # Wait for operation to complete
        while True:
            read_result = self.client.get_read_result(operation_id)
            if read_result.status not in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
                break
            time.sleep(1)
        
        # Extract passport fields
        extracted_text = []
        if read_result.status == OperationStatusCodes.succeeded:
            for text_result in read_result.analyze_result.read_results:
                for line in text_result.lines:
                    extracted_text.append(line.text)
        
        # Parse passport data (implement your parsing logic)
        passport_data = self._parse_passport(extracted_text)
        return passport_data
    
    def _parse_passport(self, text_lines):
        # Implement passport parsing logic
        # This is a simplified example
        return {
            "passport_number": "N1234567",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
            "nationality": "Nepali",
            "confidence": 0.95
        }
```

### Email Service

```python
# app/services/email_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
    
    async def send_application_received(self, application):
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=application.student_email,
            subject=f"Application Received - {application.reference_number}",
            html_content=f"""
                <h2>Application Received</h2>
                <p>Dear {application.student_name},</p>
                <p>Your application has been successfully received.</p>
                <p>Reference Number: <strong>{application.reference_number}</strong></p>
                <p>You can track your application at: {settings.FRONTEND_URL}/track</p>
            """
        )
        
        try:
            response = self.client.send(message)
            return response.status_code
        except Exception as e:
            print(f"Email error: {e}")
            return None
```

### Storage Service (AWS S3)

```python
# app/services/storage_service.py
import boto3
from app.core.config import settings
import uuid

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.AWS_S3_BUCKET
    
    async def upload(self, file, path: str):
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        file_key = f"{path}/{file_id}.{file_extension}"
        
        self.s3_client.upload_fileobj(
            file.file,
            self.bucket,
            file_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Return public URL
        file_url = f"https://{self.bucket}.s3.amazonaws.com/{file_key}"
        return file_url
    
    def generate_presigned_url(self, file_key: str, expiration=3600):
        url = self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': file_key},
            ExpiresIn=expiration
        )
        return url
```

## Configuration

### Settings (app/core/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/churchill_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Azure OCR
    AZURE_COMPUTER_VISION_KEY: str
    AZURE_COMPUTER_VISION_ENDPOINT: str
    
    # AWS S3
    AWS_ACCESS_KEY: str
    AWS_SECRET_KEY: str
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str
    
    # Email
    SENDGRID_API_KEY: str
    FROM_EMAIL: str = "noreply@churchill.edu"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Main App (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, applications, documents, interviews, dashboard
from app.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Churchill University API",
    description="Student Application Management System API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(documents.router)
app.include_router(interviews.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Churchill University API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

## Running the Backend

```bash
# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run database migrations (if using Alembic)
alembic upgrade head
```

## Testing the Integration

```bash
# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=agent@example.com&password=password123"

# Test creating application
curl -X POST http://localhost:8000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "student_phone": "+977-9841234567",
    "destination": "Australia",
    "course": "MBA",
    "intake": "February 2025"
  }'
```

## Production Deployment

### Using Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/churchill_db
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: churchill_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

This guide provides a complete foundation for building the FastAPI backend that integrates with the React frontend!
