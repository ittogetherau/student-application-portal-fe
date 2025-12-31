import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Upload } from 'lucide-react';

export default function StudentGSForm() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl">GS Form Completion</h1>
        <p className="text-muted-foreground">
          Complete the Genuine Student assessment form
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Statement</CardTitle>
          <CardDescription>
            Tell us about your study intentions and future plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Why do you want to study this course?</Label>
            <Textarea
              placeholder="Explain your motivation and goals..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>What are your career plans after graduation?</Label>
            <Textarea
              placeholder="Describe your future career aspirations..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>How will this course help your career?</Label>
            <Textarea
              placeholder="Explain the connection between the course and your career..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Provide details about your funding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source of Funding</Label>
            <Input placeholder="e.g., Personal savings, Family support, Scholarship" />
          </div>
          <div className="space-y-2">
            <Label>Sponsor Name (if applicable)</Label>
            <Input placeholder="Enter sponsor's name" />
          </div>
          <div className="space-y-2">
            <Label>Relationship to Sponsor</Label>
            <Input placeholder="e.g., Parent, Relative" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>Upload required GS documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Financial Document', 'Relation Proof', 'Income Document'].map((docType) => (
            <div key={docType} className="border-2 border-dashed rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{docType}</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          Save as Draft
        </Button>
        <Button className="flex-1">
          Submit Form
        </Button>
      </div>
    </div>
  );
}
