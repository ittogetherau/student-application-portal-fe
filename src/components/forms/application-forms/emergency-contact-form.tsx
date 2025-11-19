'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmergencyContactFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function EmergencyContactForm({ data, onUpdate, onComplete }: EmergencyContactFormProps) {
  const { register, watch } = useForm({
    defaultValues: data,
  });

  // Watch for changes and update parent
  useEffect(() => {
    const subscription = watch((formValues) => {
      onUpdate(formValues);
      
      // Check if required fields are filled
      const requiredFields = ['contactPerson', 'relationship', 'phone'];
      const allFilled = requiredFields.every(field => formValues[field]);
      if (allFilled) {
        onComplete();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate, onComplete]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="required">Contact Person</Label>
          <Input id="contactPerson" {...register('contactPerson', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship" className="required">Relationship</Label>
          <Input id="relationship" {...register('relationship', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="required">Phone</Label>
          <Input id="phone" {...register('phone', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" {...register('email')} />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input id="address" {...register('address')} />
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

