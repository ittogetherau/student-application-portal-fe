'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FormField from '@/components/forms/form-field';

interface QualificationsFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function QualificationsForm({ data, onUpdate, onComplete }: QualificationsFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const hasQualifications = watch("hasQualifications");

  useEffect(() => {
    const subscription = watch((formValues) => {
      onUpdate(formValues);

      if (formValues.hasQualifications !== undefined) {
        onComplete();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onUpdate, onComplete]);

  return (
    <div className="space-y-6">
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

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}

