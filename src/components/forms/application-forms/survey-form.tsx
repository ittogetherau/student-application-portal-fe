'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormField from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

const surveySchema = z.object({
  surveyContactStatus: z.string().min(1, 'Please select an option'),
});

type SurveyValues = z.infer<typeof surveySchema>;

export default function SurveyForm() {
  const { watch, setValue, handleSubmit, reset } = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      surveyContactStatus: '',
    },
  });

  const surveyContactStatus = watch("surveyContactStatus");

  const onSubmit = (values: SurveyValues) => {
    console.log('Survey form submitted', values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

      <div className="flex justify-end">
        <Button type="submit">Submit Survey</Button>
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </form>
  );
}

