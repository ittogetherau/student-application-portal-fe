import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';

interface ManageEnrollmentFormProps {
  data: any;
  allData?: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

interface Enrollment {
  id: string;
  course: string;
  attempt: number;
  campus: string;
  intakeDate: string;
  studyPeriod: string;
  courseLength: string;
  tuitionFee: string;
  status: string;
}

export default function ManageEnrollmentForm({
  data,
  onUpdate,
  onComplete,
}: ManageEnrollmentFormProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(
    data.enrollments || []
  );
  const [formData, setFormData] = useState({
    agentId: data.agentId || '',
    campus: data.campus || '',
    courseType: data.courseType || '',
    intakeYear: data.intakeYear || '',
    course: data.course || '',
    preferredStartDate: data.preferredStartDate || '',
  });

  const handleFieldChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdate({ ...newFormData, enrollments });
  };

  const handleAddCourse = () => {
    if (!formData.course || !formData.campus || !formData.preferredStartDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newEnrollment: Enrollment = {
      id: `ENR-${Date.now()}`,
      course: formData.course,
      attempt: 1,
      campus: formData.campus,
      intakeDate: formData.preferredStartDate,
      studyPeriod: '2024-2025',
      courseLength: '2 years',
      tuitionFee: '$25,000',
      status: 'Pending',
    };

    const newEnrollments = [...enrollments, newEnrollment];
    setEnrollments(newEnrollments);
    onUpdate({ ...formData, enrollments: newEnrollments });
    onComplete();

    // Reset form
    setFormData({
      ...formData,
      course: '',
      preferredStartDate: '',
    });
  };

  const handleDeleteEnrollment = (id: string) => {
    const newEnrollments = enrollments.filter((e) => e.id !== id);
    setEnrollments(newEnrollments);
    onUpdate({ ...formData, enrollments: newEnrollments });
  };

  return (
    <div className="space-y-6">
      {/* Add Course Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            Add a Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Apply Under Agent */}
            <div className="space-y-1.5">
              <Label htmlFor="agentId" className="text-sm">
                Apply Under Agent
              </Label>
              <Select
                value={formData.agentId}
                onValueChange={(value) => handleFieldChange('agentId', value)}
              >
                <SelectTrigger id="agentId" className="h-9">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent-1">John Agent (AG001)</SelectItem>
                  <SelectItem value="agent-2">Sarah Agent (AG002)</SelectItem>
                  <SelectItem value="agent-3">Mike Agent (AG003)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Which Campus */}
            <div className="space-y-1.5">
              <Label htmlFor="campus" className="text-sm">
                Which Campus
              </Label>
              <Select
                value={formData.campus}
                onValueChange={(value) => handleFieldChange('campus', value)}
              >
                <SelectTrigger id="campus" className="h-9">
                  <SelectValue placeholder="Select campus..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIHE Parramatta Campus">
                    CIHE Parramatta Campus
                  </SelectItem>
                  <SelectItem value="CIHE Sydney Campus">
                    CIHE Sydney Campus
                  </SelectItem>
                  <SelectItem value="CIHE Melbourne Campus">
                    CIHE Melbourne Campus
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Type */}
            <div className="space-y-1.5">
              <Label htmlFor="courseType" className="text-sm">
                Course Type
              </Label>
              <Select
                value={formData.courseType}
                onValueChange={(value) => handleFieldChange('courseType', value)}
              >
                <SelectTrigger id="courseType" className="h-9">
                  <SelectValue placeholder="Select course type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HigherEd">HigherEd</SelectItem>
                  <SelectItem value="VET">VET</SelectItem>
                  <SelectItem value="ELICOS">ELICOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intake Year */}
            <div className="space-y-1.5">
              <Label htmlFor="intakeYear" className="text-sm">
                Intake Year
              </Label>
              <Select
                value={formData.intakeYear}
                onValueChange={(value) => handleFieldChange('intakeYear', value)}
              >
                <SelectTrigger id="intakeYear" className="h-9">
                  <SelectValue placeholder="Select intake year..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select Course */}
            <div className="space-y-1.5">
              <Label htmlFor="course" className="text-sm">
                Select Course
              </Label>
              <Select
                value={formData.course}
                onValueChange={(value) => handleFieldChange('course', value)}
              >
                <SelectTrigger id="course" className="h-9">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bachelor of Business">
                    Bachelor of Business
                  </SelectItem>
                  <SelectItem value="Bachelor of IT">Bachelor of IT</SelectItem>
                  <SelectItem value="Master of Business Administration">
                    Master of Business Administration
                  </SelectItem>
                  <SelectItem value="Diploma of Accounting">
                    Diploma of Accounting
                  </SelectItem>
                  <SelectItem value="Certificate IV in Business">
                    Certificate IV in Business
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="preferredStartDate" className="text-sm">
                Preferred Start Date
              </Label>
              <Input
                id="preferredStartDate"
                type="date"
                className="h-9"
                value={formData.preferredStartDate}
                onChange={(e) =>
                  handleFieldChange('preferredStartDate', e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleAddCourse} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      {enrollments.length > 0 && (
        <div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Current Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-10">ID</TableHead>
                    <TableHead className="h-10">COURSE</TableHead>
                    <TableHead className="h-10">ATTEMPT</TableHead>
                    <TableHead className="h-10">CAMPUS</TableHead>
                    <TableHead className="h-10">INTAKE DATE</TableHead>
                    <TableHead className="h-10">STUDY PERIOD</TableHead>
                    <TableHead className="h-10">COURSE LENGTH</TableHead>
                    <TableHead className="h-10">TUITION FEE</TableHead>
                    <TableHead className="h-10">STATUS</TableHead>
                    <TableHead className="h-10 text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium py-3">
                        {enrollment.id}
                      </TableCell>
                      <TableCell className="py-3">{enrollment.course}</TableCell>
                      <TableCell className="py-3">{enrollment.attempt}</TableCell>
                      <TableCell className="py-3">{enrollment.campus}</TableCell>
                      <TableCell className="py-3">{enrollment.intakeDate}</TableCell>
                      <TableCell className="py-3">{enrollment.studyPeriod}</TableCell>
                      <TableCell className="py-3">{enrollment.courseLength}</TableCell>
                      <TableCell className="py-3">{enrollment.tuitionFee}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant="secondary" className="text-xs">
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteEnrollment(enrollment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  );
}