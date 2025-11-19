'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SchoolingFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function SchoolingForm({ data, onUpdate, onComplete }: SchoolingFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues, onUpdate]);

  useEffect(() => {
    if (formValues.highestSchoolLevel && formValues.stillAttending !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  const canSelectStillAttending = formValues.highestSchoolLevel && formValues.highestSchoolLevel !== '02';

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="required">What is your highest COMPLETED school level?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            If you are currently enrolled in secondary education, the Highest school level completed refers to the highest school level you have actually completed and not the level you are currently undertaking.
          </p>
        </div>
        <RadioGroup
          value={formValues.highestSchoolLevel}
          onValueChange={(value) => setValue('highestSchoolLevel', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="02" id="level-02" />
            <Label htmlFor="level-02" className="font-normal cursor-pointer">02 - Did not go to School</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="08" id="level-08" />
            <Label htmlFor="level-08" className="font-normal cursor-pointer">08 - Year 8 or below</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="09" id="level-09" />
            <Label htmlFor="level-09" className="font-normal cursor-pointer">09 - Year 9 or below</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="10" id="level-10" />
            <Label htmlFor="level-10" className="font-normal cursor-pointer">10 - Completed year 10</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="11" id="level-11" />
            <Label htmlFor="level-11" className="font-normal cursor-pointer">11 - Completed year 11</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="12" id="level-12" />
            <Label htmlFor="level-12" className="font-normal cursor-pointer">12 - Completed year 12</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="@@" id="level-@@" />
            <Label htmlFor="level-@@" className="font-normal cursor-pointer">@@ - Not Specified</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className={canSelectStillAttending ? 'required' : ''}>
          Are you still attending secondary school?
        </Label>
        <RadioGroup
          value={formValues.stillAttending}
          onValueChange={(value) => setValue('stillAttending', value)}
          disabled={!canSelectStillAttending}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="attending-yes" disabled={!canSelectStillAttending} />
              <Label htmlFor="attending-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="attending-no" disabled={!canSelectStillAttending} />
              <Label htmlFor="attending-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </div>
        </RadioGroup>
        {!canSelectStillAttending && formValues.highestSchoolLevel === '02' && (
          <p className="text-sm text-muted-foreground">Not applicable (Did not go to school)</p>
        )}
      </div>

      {formValues.stillAttending === 'yes' && (
        <div className="space-y-2">
          <Label>What is your secondary school?</Label>
          <RadioGroup
            value={formValues.schoolType}
            onValueChange={(value) => setValue('schoolType', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="government" id="government" />
              <Label htmlFor="government" className="font-normal cursor-pointer">School (Government)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="catholic" id="catholic" />
              <Label htmlFor="catholic" className="font-normal cursor-pointer">School (Catholic)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="independent" id="independent" />
              <Label htmlFor="independent" className="font-normal cursor-pointer">School (Independent)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tafe" id="tafe" />
              <Label htmlFor="tafe" className="font-normal cursor-pointer">Technical and Further Education institute</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="community" id="community" />
              <Label htmlFor="community" className="font-normal cursor-pointer">Community based adult education provider</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private-rto" id="private-rto" />
              <Label htmlFor="private-rto" className="font-normal cursor-pointer">Privately Operated registered training organisation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="homeschool" id="homeschool" />
              <Label htmlFor="homeschool" className="font-normal cursor-pointer">Home school arrangement</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fundingSource">Funding Source State</Label>
        <Select
          value={formValues.fundingSource}
          onValueChange={(value) => setValue('fundingSource', value)}
        >
          <SelectTrigger id="fundingSource">
            <SelectValue placeholder="Select Funding..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder">Please select...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="required">VET in school?</Label>
        <RadioGroup
          value={formValues.vetInSchool}
          onValueChange={(value) => setValue('vetInSchool', value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="vet-yes" />
              <Label htmlFor="vet-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="vet-no" />
              <Label htmlFor="vet-no" className="font-normal cursor-pointer">No</Label>
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

