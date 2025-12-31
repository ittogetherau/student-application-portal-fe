import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues]);

  useEffect(() => {
    if (formValues.hasQualifications !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="required">Have you successfully completed any previous qualifications?</Label>
        <RadioGroup
          value={formValues.hasQualifications}
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