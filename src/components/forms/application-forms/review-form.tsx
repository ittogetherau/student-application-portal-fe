'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ReviewFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function ReviewForm({ allData, onComplete }: ReviewFormProps) {
  const hasCalledComplete = useRef(false);
  
  const personalDetails = allData[1] || {};
  const emergencyContact = allData[2] || {};
  const healthCover = allData[3] || {};
  const languageCultural = allData[4] || {};
  const disability = allData[5] || {};
  const schooling = allData[6] || {};
  const qualifications = allData[7] || {};
  const employment = allData[8] || {};
  const usi = allData[9] || {};
  const additionalServices = allData[10] || {};
  const survey = allData[11] || {};
  const documents = allData[12] || {};

  // Auto-complete this step (only once)
  useEffect(() => {
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete();
    }
  }, []);

  const renderField = (label: string, value: any) => {
    if (!value) return null;
    return (
      <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value}</dd>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <p className="text-sm">
          Please review all information before submitting. You can go back to any section to make changes.
        </p>
      </div>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Student Origin', personalDetails.studentOrigin)}
            {renderField('Title', personalDetails.title)}
            {renderField('Full Name', `${personalDetails.firstName || ''} ${personalDetails.middleName || ''} ${personalDetails.lastName || ''}`.trim())}
            {renderField('Gender', personalDetails.gender)}
            {renderField('Date of Birth', personalDetails.dateOfBirth)}
            {renderField('Contact Email', personalDetails.contactEmail)}
            {renderField('Mobile Number', personalDetails.mobileNumber)}
            {renderField('Passport Number', personalDetails.passportNumber)}
            {renderField('Nationality', personalDetails.nationality)}
            {renderField('Residential Address', `${personalDetails.resStreetNumber || ''} ${personalDetails.resStreetName || ''}, ${personalDetails.resCity || ''}, ${personalDetails.resState || ''} ${personalDetails.resPostCode || ''}`.trim())}
          </dl>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Contact Person', emergencyContact.contactPerson)}
            {renderField('Relationship', emergencyContact.relationship)}
            {renderField('Phone', emergencyContact.phone)}
            {renderField('Email', emergencyContact.email)}
          </dl>
        </CardContent>
      </Card>

      {/* Health Cover */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overseas Student Health Cover</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Apply for OSHC', healthCover.applyOHSC)}
          </dl>
        </CardContent>
      </Card>

      {/* Language & Cultural */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Language and Cultural Diversity</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Aboriginal/Torres Strait Islander Origin', languageCultural.aboriginalOrigin)}
            {renderField('English Main Language', languageCultural.englishMain)}
            {languageCultural.englishMain === 'no' && (
              <>
                {renderField('Main Language', languageCultural.mainLanguage)}
                {renderField('English Proficiency', languageCultural.englishProficiency)}
              </>
            )}
            {renderField('Completed English Test', languageCultural.completedEnglishTest)}
            {languageCultural.englishTests?.length > 0 && (
              <div className="py-2">
                <dt className="text-sm text-muted-foreground mb-2">English Tests</dt>
                <dd className="space-y-2">
                  {languageCultural.englishTests.map((test: any, i: number) => (
                    <div key={i} className="text-sm border rounded p-2">
                      {test.testType} - {test.testDate} - Overall: {test.overallScore}
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Disability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disability</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Has Disability', disability.hasDisability)}
          </dl>
        </CardContent>
      </Card>

      {/* Schooling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schooling</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Highest School Level', schooling.highestSchoolLevel)}
            {renderField('Still Attending', schooling.stillAttending)}
            {renderField('School Type', schooling.schoolType)}
            {renderField('VET in School', schooling.vetInSchool)}
          </dl>
        </CardContent>
      </Card>

      {/* Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employment</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Employment Status', employment.employmentStatus)}
            {employment.employmentHistory?.length > 0 && (
              <div className="py-2">
                <dt className="text-sm text-muted-foreground mb-2">Employment History</dt>
                <dd className="space-y-2">
                  {employment.employmentHistory.map((emp: any, i: number) => (
                    <div key={i} className="text-sm border rounded p-2">
                      {emp.employer} - {emp.occupation} ({emp.durationFrom} to {emp.durationTo})
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* USI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Unique Student Identifier (USI)</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Has USI', usi.hasUSI)}
            {usi.hasUSI === 'yes' && renderField('USI Number', usi.usiNumber)}
            {renderField('Apply USI through provider', usi.applyUSI ? 'Yes' : 'No')}
          </dl>
        </CardContent>
      </Card>

      {/* Additional Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Services</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Request Additional Services', additionalServices.requestAdditionalServices)}
          </dl>
        </CardContent>
      </Card>

      {/* Survey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {renderField('Survey Contact Status', survey.surveyContactStatus)}
          </dl>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.documents?.length > 0 ? (
            <div className="space-y-2">
              {documents.documents.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{doc.title}</span>
                    <Badge variant={doc.required ? 'destructive' : 'secondary'} className="text-xs">
                      {doc.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  {doc.files.length > 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">{doc.files.length} file(s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Not uploaded</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

