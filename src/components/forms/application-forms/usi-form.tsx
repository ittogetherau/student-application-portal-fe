'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import FormField from '@/components/forms/form-field';

interface USIFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function USIForm({ data, onUpdate, onComplete }: USIFormProps) {
  const { register, watch, setValue } = useForm({
    defaultValues: data,
  });

  const hasUSI = watch("hasUSI");
  const applyUSI = watch("applyUSI");

  useEffect(() => {
    const subscription = watch((formValues) => {
      onUpdate(formValues);

      if (formValues.hasUSI !== undefined) {
        onComplete();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onUpdate, onComplete]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm">
          You may already have a USI if you have done any nationally recognised training, which could include training at work, completing a first aid course or RSA (Responsible Service of Alcohol) course, getting a white card, or studying at a TAFE or training organisation. It is important that you try to find out whether you already have a USI before attempting to create a new one. You should not have more than one USI. To check if you already have a USI, use the 'Forgotten USI' link on the USI website at <a href="https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/</a>.
        </p>
      </div>

      <FormField label="Do you already have a USI?" required>
        <RadioGroup
          value={hasUSI}
          onValueChange={(value) => setValue('hasUSI', value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="usi-yes" />
              <Label htmlFor="usi-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="usi-no" />
              <Label htmlFor="usi-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      {hasUSI === 'yes' && (
        <FormField label="USI Number" htmlFor="usiNumber">
          <Input id="usiNumber" {...register('usiNumber')} placeholder="Enter your USI" />
        </FormField>
      )}

      <FormField label="Apply USI through your education provider on my behalf">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="applyUSI"
            checked={!!applyUSI}
            onCheckedChange={(checked) => setValue('applyUSI', checked)}
          />
          <Label htmlFor="applyUSI" className="font-normal cursor-pointer">
            I authorize my provider to apply for a USI on my behalf
          </Label>
        </div>
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

