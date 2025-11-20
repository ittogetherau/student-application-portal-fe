'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormField from '@/components/forms/form-field';

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

  const surveyContactStatus = watch("surveyContactStatus");

  useEffect(() => {
    const subscription = watch((formValues) => {
      onUpdate(formValues);

      if (formValues.surveyContactStatus) {
        onComplete();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onUpdate, onComplete]);

  return (
    <div className="space-y-6">
      <FormField label="Survey Contact Status" required htmlFor="surveyContactStatus">
        <Select
          value={surveyContactStatus}
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
      </FormField>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}

