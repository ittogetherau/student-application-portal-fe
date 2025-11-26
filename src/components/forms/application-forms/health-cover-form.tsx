'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FormField from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

const healthCoverSchema = z.object({
  applyOHSC: z.string().min(1, 'Please choose an option'),
});

type HealthCoverValues = z.infer<typeof healthCoverSchema>;

export default function HealthCoverForm() {
  const { watch, setValue, handleSubmit, reset } = useForm<HealthCoverValues>({
    resolver: zodResolver(healthCoverSchema),
    defaultValues: {
      applyOHSC: '',
    },
  });

  const applyOHSC = watch("applyOHSC");

  const onSubmit = (values: HealthCoverValues) => {
    console.log('Health cover submitted', values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <p className="text-sm mb-4">
          Do you wish to apply for Overseas Student Health Cover (OSHC) through your education provider?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          <strong>Note:</strong> If you select yes, OSHC cost will be added as a cost in your offer letter.
        </p>
      </div>

      <FormField label="Apply for OSHC" required>
        <RadioGroup
          value={applyOHSC}
          onValueChange={(value) => setValue('applyOHSC', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="oshc-yes" />
            <Label htmlFor="oshc-yes" className="font-normal cursor-pointer">
              Yes, I wish to apply for OSHC
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="oshc-no" />
            <Label htmlFor="oshc-no" className="font-normal cursor-pointer">
              No, I will arrange my own health cover
            </Label>
          </div>
        </RadioGroup>
      </FormField>

      <div className="flex justify-end">
        <Button type="submit">Submit Health Cover</Button>
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

