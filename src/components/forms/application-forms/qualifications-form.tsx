'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FormField from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

const qualificationsSchema = z.object({
  hasQualifications: z.string().min(1, 'Please select an option'),
});

type QualificationsValues = z.infer<typeof qualificationsSchema>;

export default function QualificationsForm() {
  const { watch, setValue, handleSubmit, reset } = useForm<QualificationsValues>({
    resolver: zodResolver(qualificationsSchema),
    defaultValues: {
      hasQualifications: '',
    },
  });

  const hasQualifications = watch("hasQualifications");

  const onSubmit = (values: QualificationsValues) => {
    console.log('Qualifications form submitted', values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Have you successfully completed any previous qualifications?" required>
        <RadioGroup
          value={hasQualifications}
          onValueChange={(value) => setValue('hasQualifications', value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="qual-yes" />
              <Label htmlFor="qual-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="qual-no" />
              <Label htmlFor="qual-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <div className="flex justify-end">
        <Button type="submit">Submit Qualifications</Button>
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

