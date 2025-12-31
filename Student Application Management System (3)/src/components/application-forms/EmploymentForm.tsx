import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface EmploymentFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function EmploymentForm({ data, onUpdate, onComplete }: EmploymentFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();
  const [employmentHistory, setEmploymentHistory] = useState<any[]>(data.employmentHistory || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployment, setCurrentEmployment] = useState<any>({});

  useEffect(() => {
    onUpdate({ ...formValues, employmentHistory });
  }, [formValues, employmentHistory]);

  useEffect(() => {
    if (formValues.employmentStatus) {
      onComplete();
    }
  }, [formValues, onComplete]);

  const handleAddEmployment = () => {
    setEmploymentHistory([...employmentHistory, currentEmployment]);
    setCurrentEmployment({});
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          For casual, seasonal, contract and shift work, use the current number of hours worked per week to determine whether full time (35 hours or more per week) or part-time employed (less than 35 hours per week).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employmentStatus" className="required">Which BEST describes your current employment status?</Label>
        <Select
          value={formValues.employmentStatus}
          onValueChange={(value) => setValue('employmentStatus', value)}
        >
          <SelectTrigger id="employmentStatus">
            <SelectValue placeholder="Select employment status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="01">01 - Full time employee</SelectItem>
            <SelectItem value="02">02 - Part-time employee</SelectItem>
            <SelectItem value="03">03 - Self-employed - not employing others</SelectItem>
            <SelectItem value="04">04 - Employer</SelectItem>
            <SelectItem value="05">05 - Employed - unpaid worker in family business</SelectItem>
            <SelectItem value="06">06 - Unemployed - seeking fulltime work</SelectItem>
            <SelectItem value="07">07 - Unemployed - seeking parttime work</SelectItem>
            <SelectItem value="08">08 - Not employed - not seeking employment</SelectItem>
            <SelectItem value="@@">@@ - Not Specified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Employment History</Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employer (optional)</Label>
                  <Input
                    value={currentEmployment.employer}
                    onChange={(e) => setCurrentEmployment({ ...currentEmployment, employer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occupation (optional)</Label>
                  <Input
                    value={currentEmployment.occupation}
                    onChange={(e) => setCurrentEmployment({ ...currentEmployment, occupation: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration From (optional)</Label>
                    <Input
                      type="date"
                      value={currentEmployment.durationFrom}
                      onChange={(e) => setCurrentEmployment({ ...currentEmployment, durationFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration To (optional)</Label>
                    <Input
                      type="date"
                      value={currentEmployment.durationTo}
                      onChange={(e) => setCurrentEmployment({ ...currentEmployment, durationTo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duties (optional)</Label>
                  <textarea
                    value={currentEmployment.duties}
                    onChange={(e) => setCurrentEmployment({ ...currentEmployment, duties: e.target.value })}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <Button onClick={handleAddEmployment} className="w-full">
                  Add Employment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {employmentHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
            You have not added employment yet.
          </p>
        ) : (
          <div className="space-y-2">
            {employmentHistory.map((emp, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{emp.employer || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {emp.occupation} • {emp.durationFrom} - {emp.durationTo}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmploymentHistory(employmentHistory.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}
