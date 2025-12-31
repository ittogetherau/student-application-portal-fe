import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface HealthCoverFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function HealthCoverForm({ data, onUpdate, onComplete }: HealthCoverFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues]);

  useEffect(() => {
    if (formValues.applyOHSC !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm mb-4">
          Do you wish to apply for Overseas Student Health Cover (OSHC) through your education provider?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          <strong>Note:</strong> If you select yes, OSHC cost will be added as a cost in your offer letter.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="required">Apply for OSHC</Label>
        <RadioGroup
          value={formValues.applyOHSC}
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
