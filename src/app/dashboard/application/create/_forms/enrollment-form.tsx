"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Enrollment {
  id: string;
  course: string;
  attempt: number;
  campus: string;
  intakeDate: string;
  tuitionFee: string;
  status: string;
}

const EnrollmentForm = () => {
  const { goToNext } = useApplicationStepStore();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [formData, setFormData] = useState({
    agentId: "",
    campus: "",
    courseType: "",
    intakeYear: "",
    course: "",
    preferredStartDate: "",
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleAddCourse = () => {
    if (!formData.course || !formData.campus || !formData.preferredStartDate) {
      return;
    }

    const newEnrollment: Enrollment = {
      id: `ENR-${Date.now()}`,
      course: formData.course,
      attempt: enrollments.length + 1,
      campus: formData.campus,
      intakeDate: formData.preferredStartDate,
      tuitionFee: "$25,000",
      status: "Pending",
    };

    setEnrollments((p) => [...p, newEnrollment]);
    setFormData((p) => ({ ...p, course: "", preferredStartDate: "" }));
  };

  const handleDeleteEnrollment = (id: string) => {
    setEnrollments((p) => p.filter((e) => e.id !== id));
  };

  const handleSaveAndContinue = () => {
    console.log("submit", { formData, enrollments });

    goToNext();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Add a Course
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Apply Under Agent</Label>
              <Select
                value={formData.agentId}
                onValueChange={(v) => handleFieldChange("agentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent-1">Agent 1</SelectItem>
                  <SelectItem value="agent-2">Agent 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Campus</Label>
              <Select
                value={formData.campus}
                onValueChange={(v) => handleFieldChange("campus", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sydney">Sydney</SelectItem>
                  <SelectItem value="Melbourne">Melbourne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Course Type</Label>
              <Select
                value={formData.courseType}
                onValueChange={(v) => handleFieldChange("courseType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HigherEd">HigherEd</SelectItem>
                  <SelectItem value="VET">VET</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Intake Year</Label>
              <Select
                value={formData.intakeYear}
                onValueChange={(v) => handleFieldChange("intakeYear", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Course</Label>
              <Select
                value={formData.course}
                onValueChange={(v) => handleFieldChange("course", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bachelor of Business">
                    Bachelor of Business
                  </SelectItem>
                  <SelectItem value="Bachelor of IT">Bachelor of IT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Start Date</Label>
              <Input
                type="date"
                value={formData.preferredStartDate}
                onChange={(e) =>
                  handleFieldChange("preferredStartDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddCourse} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {enrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Current Enrollments</h2>
            <Badge>{enrollments.length}</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.course}</TableCell>
                  <TableCell>{e.attempt}</TableCell>
                  <TableCell>{e.campus}</TableCell>
                  <TableCell>{e.intakeDate}</TableCell>
                  <TableCell>{e.tuitionFee}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteEnrollment(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSaveAndContinue}>Save & Next</Button>
      </div>
    </div>
  );
};

export default EnrollmentForm;
