'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface DisabilityFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function DisabilityForm({ data, onUpdate, onComplete }: DisabilityFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues, onUpdate]);

  useEffect(() => {
    if (formValues.hasDisability !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  const disabilities = [
    { id: 'hearing', label: 'Hearing/deaf' },
    { id: 'physical', label: 'Physical' },
    { id: 'intellectual', label: 'Intellectual' },
    { id: 'learning', label: 'Learning' },
    { id: 'mental', label: 'Mental illness' },
    { id: 'brain', label: 'Acquired brain impairment' },
    { id: 'vision', label: 'Vision' },
    { id: 'medical', label: 'Medical condition' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="required">Do you consider yourself to have a disability, impairment or long-term condition?</Label>
        <RadioGroup
          value={formValues.hasDisability}
          onValueChange={(value) => setValue('hasDisability', value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="disability-yes" />
              <Label htmlFor="disability-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="disability-no" />
              <Label htmlFor="disability-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {formValues.hasDisability === 'yes' && (
        <div className="space-y-3">
          <Label>If Yes, select from the list below:</Label>
          {disabilities.map((disability) => (
            <div key={disability.id} className="flex items-center space-x-2">
              <Checkbox
                id={disability.id}
                checked={formValues.disabilityTypes?.[disability.id] || false}
                onCheckedChange={(checked) => setValue(`disabilityTypes.${disability.id}`, checked)}
              />
              <Label htmlFor={disability.id} className="font-normal cursor-pointer">
                {disability.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}

