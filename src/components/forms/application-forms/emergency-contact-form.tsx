'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const emergencyContactSchema = z.object({
  contactPerson: z.string().min(1, 'Contact person is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;

export default function EmergencyContactForm() {
  const { register, handleSubmit, reset } = useForm<EmergencyContactValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      contactPerson: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const onSubmit = (values: EmergencyContactValues) => {
    console.log('Emergency contact submitted', values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="required">Contact Person</Label>
          <Input id="contactPerson" {...register('contactPerson')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship" className="required">Relationship</Label>
          <Input id="relationship" {...register('relationship')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="required">Phone</Label>
          <Input id="phone" {...register('phone')} />
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

      <div className="flex justify-end">
        <Button type="submit">Submit Emergency Contact</Button>
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

