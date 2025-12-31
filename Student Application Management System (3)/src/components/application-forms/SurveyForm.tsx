import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SurveyFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function SurveyForm({ data, onUpdate, onComplete }: SurveyFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues]);

  useEffect(() => {
    if (formValues.surveyContactStatus) {
      onComplete();
    }
  }, [formValues, onComplete]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="surveyContactStatus" className="required">Survey Contact Status</Label>
        <Select
          value={formValues.surveyContactStatus}
          onValueChange={(value) => setValue('surveyContactStatus', value)}
        >
          <SelectTrigger id="surveyContactStatus">
            <SelectValue placeholder="Select one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available for survey use</SelectItem>
            <SelectItem value="correctional">Correctional facility (address or enrolment)</SelectItem>
            <SelectItem value="deceased">Deceased student</SelectItem>
            <SelectItem value="excluded">Excluded from survey use</SelectItem>
            <SelectItem value="invalid">Invalid address/Itinerant student</SelectItem>
            <SelectItem value="minor">Minor - under age of 15 (not to be surveyed)</SelectItem>
            <SelectItem value="overseas">Overseas (address or enrolment)</SelectItem>
          </SelectContent>
        </Select>
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
