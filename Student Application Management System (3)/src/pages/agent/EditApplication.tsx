import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { cn } from '../../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import { mockApplications } from '../../lib/mockData';

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

export default function EditApplication() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Load existing application data
  useEffect(() => {
    const loadApplicationData = () => {
      const application = mockApplications.find(app => app.id === id);
      
      if (!application) {
        toast.error('Application not found');
        navigate('/agent/applications');
        return;
      }

      // Convert application data to form data structure
      // Pre-populate with existing data from the application
      const initialFormData: Record<string, any> = {
        1: { // Manage Enrollment
          enrollmentStatus: 'active',
          enrollmentDate: '2023-01-15',
        },
        2: { // Personal Details
          title: 'Mr',
          firstName: application.studentName.split(' ')[0] || '',
          middleName: '',
          familyName: application.studentName.split(' ').slice(1).join(' ') || '',
          preferredName: '',
          dateOfBirth: '1998-05-15',
          gender: 'Male',
          countryOfBirth: 'Nepal',
          townOfBirth: 'Kathmandu',
          email: application.studentEmail,
          phone: application.studentPhone,
          address: '123 Sample Street',
          suburb: 'Sample Suburb',
          state: 'NSW',
          postcode: '2000',
          country: 'Australia',
        },
        3: { // Emergency Contact
          name: 'John Doe',
          relationship: 'Father',
          phone: '+977-9841234567',
          email: 'emergency@example.com',
        },
        4: { // Health Cover
          hasOSHC: 'yes',
          provider: 'BUPA',
          policyNumber: 'OSHC123456',
        },
        5: { // Language & Culture
          mainLanguage: 'Nepali',
          englishProficiency: 'Good',
          interpreterNeeded: 'no',
          culturalBackground: 'South Asian',
        },
        6: { // Disability
          hasDisability: 'no',
          disabilityDetails: '',
          requiresSupport: 'no',
        },
        7: { // Schooling
          highestEducation: 'High School',
          schoolName: 'Sample High School',
          yearCompleted: '2016',
          country: 'Nepal',
        },
        8: { // Qualifications
          qualifications: [
            {
              type: 'Bachelor',
              institution: 'Sample University',
              yearOfPassing: '2020',
              grade: 'First Class',
            }
          ],
        },
        9: { // Employment
          currentlyEmployed: 'no',
          employer: '',
          position: '',
          yearsEmployed: '',
        },
        10: { // USI
          hasUSI: 'no',
          usiNumber: '',
        },
        11: { // Additional Services
          airportPickup: 'yes',
          accommodation: 'homestay',
        },
        12: { // Survey
          howDidYouHear: 'Agent',
          whyChooseUs: 'Reputation and quality education',
        },
        13: { // Documents
          uploadedDocuments: [],
        },
      };

      setFormData(initialFormData);
      
      // Don't mark steps as completed - let them be marked as user goes through them
      // setCompletedSteps(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
      
      setLoading(false);
    };

    loadApplicationData();
  }, [id, navigate]);

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
      // Here you would make the API call to update the application
      console.log('Updating application:', id, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Application updated successfully!');
      navigate('/agent/applications');
    } catch (error) {
      toast.error('Failed to update application. Please try again.');
      console.error('Update error:', error);
    }
  };

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
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  const CurrentStepComponent = FORM_STEPS[currentStep - 1].component;
  const totalSteps = FORM_STEPS.length - 1;
  const completedStepsWithoutReview = Array.from(completedSteps).filter(id => id !== 14).length;
  const progress = (completedStepsWithoutReview / totalSteps) * 100;

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
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep} of {FORM_STEPS.length}</span>
                </div>
                <h2 className="text-2xl">{FORM_STEPS[currentStep - 1].title}</h2>
              </div>

              <CurrentStepComponent
                data={formData[currentStep] || {}}
                allData={formData}
                onUpdate={(data: any) => updateFormData(currentStep, data)}
                onComplete={() => markStepComplete(currentStep)}
              />
            </CardContent>
          </Card>

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
                    Update Application
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