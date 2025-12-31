import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';

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

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues]);

  useEffect(() => {
    if (formValues.hasUSI !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm">
          You may already have a USI if you have done any nationally recognised training, which could include training at work, completing a first aid course or RSA (Responsible Service of Alcohol) course, getting a white card, or studying at a TAFE or training organisation. It is important that you try to find out whether you already have a USI before attempting to create a new one. You should not have more than one USI. To check if you already have a USI, use the 'Forgotten USI' link on the USI website at <a href="https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/</a>.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="required">Do you already have a USI?</Label>
        <RadioGroup
          value={formValues.hasUSI}
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
      </div>

      {formValues.hasUSI === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="usiNumber">USI Number</Label>
          <Input id="usiNumber" {...register('usiNumber')} placeholder="Enter your USI" />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="applyUSI"
          checked={formValues.applyUSI}
          onCheckedChange={(checked) => setValue('applyUSI', checked)}
        />
        <Label htmlFor="applyUSI" className="font-normal cursor-pointer">
          Apply USI through your education provider on my behalf
        </Label>
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
