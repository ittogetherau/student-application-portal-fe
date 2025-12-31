import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, FileText, User, Briefcase, GraduationCap, HeartPulse, Users, Globe, ShieldCheck, Upload, ClipboardList, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../components/ui/utils';
import { addActivity, ActivityActions } from '../../lib/activityLogger';
import { Role } from '../../lib/types';

// Import form step components
import ManageEnrollmentForm from '../../components/application-forms/ManageEnrollmentForm';
import PersonalDetailsForm from '../../components/application-forms/PersonalDetailsForm';
import EmergencyContactForm from '../../components/application-forms/EmergencyContactForm';
import HealthCoverForm from '../../components/application-forms/HealthCoverForm';
import LanguageCulturalForm from '../../components/application-forms/LanguageCulturalForm';
import DisabilityForm from '../../components/application-forms/DisabilityForm';
import SchoolingForm from '../../components/application-forms/SchoolingForm';
import QualificationsForm from '../../components/application-forms/QualificationsForm';
import EmploymentForm from '../../components/application-forms/EmploymentForm';
import USIForm from '../../components/application-forms/USIForm';
import AdditionalServicesForm from '../../components/application-forms/AdditionalServicesForm';
import SurveyForm from '../../components/application-forms/SurveyForm';
import DocumentsForm from '../../components/application-forms/DocumentsForm';
import ReviewForm from '../../components/application-forms/ReviewForm';

const FORM_STEPS = [
  { id: 1, title: 'Manage Enrollment', component: ManageEnrollmentForm },
  { id: 2, title: 'Personal Details', component: PersonalDetailsForm },
  { id: 3, title: 'Emergency Contact', component: EmergencyContactForm },
  { id: 4, title: 'Health Cover', component: HealthCoverForm },
  { id: 5, title: 'Language & Culture', component: LanguageCulturalForm },
  { id: 6, title: 'Disability', component: DisabilityForm },
  { id: 7, title: 'Schooling', component: SchoolingForm },
  { id: 8, title: 'Qualifications', component: QualificationsForm },
  { id: 9, title: 'Employment', component: EmploymentForm },
  { id: 10, title: 'USI', component: USIForm },
  { id: 11, title: 'Additional Services', component: AdditionalServicesForm },
  { id: 12, title: 'Survey', component: SurveyForm },
  { id: 13, title: 'Documents', component: DocumentsForm },
  { id: 14, title: 'Review', component: ReviewForm },
];

const STORAGE_KEY = 'application_form_data';

export default function NewApplication() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || {});
        setCompletedSteps(new Set(parsed.completedSteps || []));
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      formData,
      completedSteps: Array.from(completedSteps),
      currentStep,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, completedSteps, currentStep]);

  const updateFormData = (stepId: number, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  };

  const markStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleNext = () => {
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Generate a unique application ID
      const applicationId = `APP${Date.now()}`;
      const referenceNumber = `REF${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Extract student info from form data
      const personalDetails = formData[2] || {};
      const enrollmentDetails = formData[1] || {};
      
      // Create application object
      const newApplication = {
        id: applicationId,
        referenceNumber: referenceNumber,
        studentName: `${personalDetails.firstName || ''} ${personalDetails.lastName || ''}`.trim() || 'Unknown Student',
        studentEmail: personalDetails.contactEmail || '',
        course: enrollmentDetails.courseName || 'Unknown Course',
        courseCode: enrollmentDetails.courseCode || '',
        intake: enrollmentDetails.intake || '',
        destination: enrollmentDetails.campus || 'Sydney',
        status: 'submitted', // Agent sees "Application Submitted"
        submittedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        agentName: 'Current Agent', // In real app, get from auth
        agentId: 'agent-1',
        assignedStaffName: null,
        assignedStaffId: null,
        formData: formData, // Store all form data
      };
      
      // Get existing applications from localStorage
      const existingApps = JSON.parse(localStorage.getItem('submitted_applications') || '[]');
      
      // Add new application
      existingApps.push(newApplication);
      
      // Save to localStorage
      localStorage.setItem('submitted_applications', JSON.stringify(existingApps));
      
      // Log activity
      addActivity(
        applicationId,
        ActivityActions.APPLICATION_SUBMITTED,
        `Application submitted for ${newApplication.studentName} - ${newApplication.course}`,
        'agent-1',
        'Current Agent',
        Role.AGENT,
        {
          referenceNumber,
          course: newApplication.course,
          intake: newApplication.intake,
          destination: newApplication.destination
        }
      );
      
      // Clear form data after successful submission
      localStorage.removeItem(STORAGE_KEY);
      
      toast.success('Application submitted successfully!');
      
      // Navigate to applications list
      navigate('/agent/applications');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  // Auto-fill function with comprehensive mock data
  const handleAutoFill = () => {
    const mockFormData = {
      // Step 1: Manage Enrollment
      1: {
        courseType: 'full-time',
        courseLevel: 'bachelor',
        courseName: 'Bachelor of Computer Science',
        courseCode: 'BCS-2024',
        intake: 'February 2025',
        campus: 'Main Campus - Sydney',
        studyMode: 'on-campus',
      },
      // Step 2: Personal Details
      2: {
        studentOrigin: 'offshore',
        title: 'Mr',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Smith',
        preferredName: 'John',
        gender: 'male',
        dateOfBirth: '1998-05-15',
        countryOfBirth: 'India',
        cityOfBirth: 'Mumbai',
        nationality: 'Indian',
        passportNumber: 'P1234567',
        passportExpiry: '2029-12-31',
        contactEmail: 'john.smith@email.com',
        mobileNumber: '+61 412 345 678',
        resCountry: 'Australia',
        resStreetNumber: '123',
        resStreetName: 'Main Street',
        resSuburb: 'Sydney',
        resCity: 'Sydney',
        resState: 'NSW',
        resPostCode: '2000',
        postalSameAsResidential: true,
      },
      // Step 3: Emergency Contact
      3: {
        contactPerson: 'Mary Smith',
        relationship: 'Mother',
        phone: '+91 98765 43210',
        email: 'mary.smith@email.com',
        address: '456 Park Avenue, Mumbai, India',
      },
      // Step 4: Health Cover
      4: {
        applyOHSC: 'yes',
        oshcProvider: 'Bupa',
        oshcPolicyNumber: 'BP123456789',
        oshcCoverageType: 'Single',
        oshcStartDate: '2025-02-01',
        oshcDuration: '2 years',
      },
      // Step 5: Language & Cultural
      5: {
        aboriginalOrigin: 'no',
        englishMain: 'no',
        mainLanguage: 'Hindi',
        englishProficiency: 'good',
        completedEnglishTest: 'yes',
        englishTests: [
          {
            testType: 'IELTS',
            testDate: '2024-06-15',
            overallScore: '7.5',
            listeningScore: '8.0',
            readingScore: '7.5',
            writingScore: '7.0',
            speakingScore: '7.5',
          },
        ],
      },
      // Step 6: Disability
      6: {
        hasDisability: 'no',
        disabilityType: '',
        requiresAssistance: 'no',
        assistanceDetails: '',
      },
      // Step 7: Schooling
      7: {
        highestSchoolLevel: 'Year 12 or equivalent',
        yearCompleted: '2016',
        stillAttending: 'no',
        schoolType: 'Government School',
        schoolName: 'Mumbai International School',
        schoolCountry: 'India',
        vetInSchool: 'no',
      },
      // Step 8: Qualifications
      8: {
        hasPostSecondary: 'yes',
        qualifications: [
          {
            institutionName: 'University of Mumbai',
            country: 'India',
            qualification: 'Bachelor Degree',
            fieldOfStudy: 'Electronics Engineering',
            startDate: '2016-07',
            endDate: '2020-05',
            completed: 'yes',
            gpa: '3.8',
          },
        ],
      },
      // Step 9: Employment
      9: {
        employmentStatus: 'Employed',
        employmentHistory: [
          {
            employer: 'Tech Solutions Pvt Ltd',
            occupation: 'Software Developer',
            durationFrom: '2020-06',
            durationTo: '2024-10',
            stillEmployed: 'no',
            responsibilities: 'Developed web applications using React and Node.js',
          },
        ],
      },
      // Step 10: USI
      10: {
        hasUSI: 'no',
        usiNumber: '',
        applyUSI: true,
        consentUSI: true,
      },
      // Step 11: Additional Services
      11: {
        requestAdditionalServices: 'yes',
        servicesRequested: ['Accommodation', 'Airport Pickup'],
        accommodationType: 'on-campus',
        arrivalDate: '2025-01-28',
        flightNumber: 'QF412',
        arrivalTime: '14:30',
      },
      // Step 12: Survey
      12: {
        surveyContactStatus: 'yes',
        howDidYouHear: 'Education Agent',
        agentName: 'ABC Education Consultants',
        studyReasons: ['Career Advancement', 'International Experience'],
        additionalComments: 'Very excited to study at Churchill University!',
      },
      // Step 13: Documents
      13: {
        documents: [
          { 
            id: 1,
            title: 'Passport', 
            required: true,
            files: [{ name: 'passport_john_smith.pdf', size: '2.3 MB', uploadedAt: new Date().toISOString() }],
          },
          { 
            id: 2,
            title: 'Academic Transcripts', 
            required: true,
            files: [{ name: 'bachelor_certificate.pdf', size: '1.8 MB', uploadedAt: new Date().toISOString() }],
          },
          { 
            id: 3,
            title: 'English Test Results', 
            required: true,
            files: [{ name: 'ielts_certificate.pdf', size: '0.5 MB', uploadedAt: new Date().toISOString() }],
          },
          { 
            id: 4,
            title: 'Resume/CV', 
            required: false,
            files: [{ name: 'john_smith_resume.pdf', size: '0.3 MB', uploadedAt: new Date().toISOString() }],
          },
        ],
      },
    };

    // Set all form data
    setFormData(mockFormData);
    
    // Mark steps 1-13 as completed
    const completedStepIds = Array.from({ length: 13 }, (_, i) => i + 1);
    setCompletedSteps(new Set(completedStepIds));
    
    // Navigate to review step (step 14)
    setCurrentStep(14);
    
    toast.success('Form auto-filled! Review your application.');
  };

  const CurrentStepComponent = FORM_STEPS[currentStep - 1].component;
  const totalSteps = FORM_STEPS.length - 1; // Exclude Review step from total
  const completedStepsWithoutReview = Array.from(completedSteps).filter(id => id !== 14).length;
  const progress = (completedStepsWithoutReview / totalSteps) * 100;

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current!.offsetLeft);
    setScrollLeft(scrollContainerRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current!.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust the multiplier for faster/slower scrolling
    scrollContainerRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-0 z-10">
            <CardContent className="px-2 py-3">
              {/* Progress Bar */}
              <div className="mb-2 pb-2 border-b">
                <Progress value={progress} className="h-1" />
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground text-xs">Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {completedStepsWithoutReview} of {totalSteps} completed
                  </span>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={cn(
                  'flex lg:flex-col gap-2 lg:space-y-1 lg:gap-0 overflow-x-auto lg:overflow-x-visible pb-0 lg:pb-0',
                  '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
                  isDragging ? 'cursor-grabbing select-none' : 'cursor-grab lg:cursor-default'
                )}
              >
                {FORM_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      'flex-shrink-0 lg:w-full text-left px-2 py-2.5 rounded-lg transition-colors flex items-center gap-3 whitespace-nowrap lg:whitespace-normal',
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : completedSteps.has(step.id)
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-full text-xs flex-shrink-0',
                        currentStep === step.id
                          ? 'bg-primary-foreground text-primary'
                          : completedSteps.has(step.id)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted'
                      )}
                    >
                      {completedSteps.has(step.id) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-sm truncate lg:truncate">{step.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">

            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Step {currentStep} of {FORM_STEPS.length}</span>
                  </div>
                  {/* Auto-fill button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Auto-Fill Demo
                  </Button>
                </div>
                <h2 className="text-2xl mt-2">{FORM_STEPS[currentStep - 1].title}</h2>
              </div>

              <CurrentStepComponent
                data={formData[currentStep] || {}}
                allData={formData}
                onUpdate={(data: any) => updateFormData(currentStep, data)}
                onComplete={() => markStepComplete(currentStep)}
              />
            </CardContent>

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {FORM_STEPS.length}
                </span>

                {currentStep === FORM_STEPS.length ? (
                  <Button onClick={handleSubmit} className="gap-2">
                    Submit Application
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2">
                    Save & Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}