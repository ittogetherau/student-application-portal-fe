import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface LanguageCulturalFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function LanguageCulturalForm({ data, onUpdate, onComplete }: LanguageCulturalFormProps) {
  const { register, watch, setValue } = useForm({
    defaultValues: data,
  });

  const formValues = watch();
  const [englishTests, setEnglishTests] = useState<any[]>(data.englishTests || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<any>({});

  useEffect(() => {
    onUpdate({ ...formValues, englishTests });
  }, [formValues, englishTests]);

  useEffect(() => {
    if (formValues.aboriginalOrigin && formValues.englishMain !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  const handleAddTest = () => {
    setEnglishTests([...englishTests, currentTest]);
    setCurrentTest({});
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label className="required">Are you of Australian Aboriginal and Torres Strait Islander origin?</Label>
          <p className="text-sm text-muted-foreground mb-2">
            For persons of both Australian Aboriginal and Torres Strait Islander origin, mark both 'Yes' boxes.
          </p>
        </div>
        <RadioGroup
          value={formValues.aboriginalOrigin}
          onValueChange={(value) => setValue('aboriginalOrigin', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both" className="font-normal cursor-pointer">
              Yes, Both Aboriginal and Torres Strait Islander
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aboriginal" id="aboriginal" />
            <Label htmlFor="aboriginal" className="font-normal cursor-pointer">
              Yes, Only Aboriginal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="islander" id="islander" />
            <Label htmlFor="islander" className="font-normal cursor-pointer">
              Yes, Only Torres Strait Islander
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="neither" id="neither" />
            <Label htmlFor="neither" className="font-normal cursor-pointer">
              No, Neither Aboriginal and Torres Strait Islander
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not-stated" id="not-stated" />
            <Label htmlFor="not-stated" className="font-normal cursor-pointer">
              Not Stated / Prefer not to say
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label className="required">Is English your main language?</Label>
        <RadioGroup
          value={formValues.englishMain}
          onValueChange={(value) => setValue('englishMain', value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="english-yes" />
              <Label htmlFor="english-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="english-no" />
              <Label htmlFor="english-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {formValues.englishMain === 'no' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="mainLanguage">What is your Main Language?</Label>
            <Select
              value={formValues.mainLanguage}
              onValueChange={(value) => setValue('mainLanguage', value)}
            >
              <SelectTrigger id="mainLanguage">
                <SelectValue placeholder="Select Language..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mandarin">Mandarin</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="nepali">Nepali</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
                <SelectItem value="bengali">Bengali</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="englishProficiency">How well do you speak English?</Label>
            <Select
              value={formValues.englishProficiency}
              onValueChange={(value) => setValue('englishProficiency', value)}
            >
              <SelectTrigger id="englishProficiency">
                <SelectValue placeholder="Select one..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very-well">Very Well</SelectItem>
                <SelectItem value="well">Well</SelectItem>
                <SelectItem value="not-well">Not Well</SelectItem>
                <SelectItem value="not-at-all">Not at all</SelectItem>
                <SelectItem value="not-stated">Not Stated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">English Test</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Was English the language of instruction in previous secondary or tertiary studies?</Label>
            <RadioGroup
              value={formValues.englishInstruction}
              onValueChange={(value) => setValue('englishInstruction', value)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="instruction-yes" />
                  <Label htmlFor="instruction-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="instruction-no" />
                  <Label htmlFor="instruction-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Have you completed a test of English Language Proficiency?</Label>
            <RadioGroup
              value={formValues.completedEnglishTest}
              onValueChange={(value) => setValue('completedEnglishTest', value)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="test-yes" />
                  <Label htmlFor="test-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="test-no" />
                  <Label htmlFor="test-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {formValues.completedEnglishTest === 'yes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>English Tests</Label>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Test
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Test</DialogTitle>
                    <DialogDescription>
                      Add your English Language Proficiency test details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>What test did you sit?</Label>
                      <Select
                        value={currentTest.testType}
                        onValueChange={(value) => setCurrentTest({ ...currentTest, testType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ielts">International English Language Testing System (IELTS)</SelectItem>
                          <SelectItem value="toefl">Test of English as a Foreign Language (TOEFL)</SelectItem>
                          <SelectItem value="toeic">Test of English for International Communication (TOEIC)</SelectItem>
                          <SelectItem value="pte">Pearson Test of English (PTE)</SelectItem>
                          <SelectItem value="cae">Certificate in Advanced English (CAE)</SelectItem>
                          <SelectItem value="oet">Occupational English Test (OET)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date of test</Label>
                      <Input
                        type="date"
                        value={currentTest.testDate}
                        onChange={(e) => setCurrentTest({ ...currentTest, testDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Score Type</Label>
                      <RadioGroup
                        value={currentTest.scoreType}
                        onValueChange={(value) => setCurrentTest({ ...currentTest, scoreType: value })}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4skills" id="4skills" />
                            <Label htmlFor="4skills" className="font-normal cursor-pointer">4 skills</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="overall" id="overall" />
                            <Label htmlFor="overall" className="font-normal cursor-pointer">Overall only</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {currentTest.scoreType === '4skills' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Listening Score</Label>
                          <Input
                            value={currentTest.listeningScore}
                            onChange={(e) => setCurrentTest({ ...currentTest, listeningScore: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reading Score</Label>
                          <Input
                            value={currentTest.readingScore}
                            onChange={(e) => setCurrentTest({ ...currentTest, readingScore: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Writing Score</Label>
                          <Input
                            value={currentTest.writingScore}
                            onChange={(e) => setCurrentTest({ ...currentTest, writingScore: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Speaking Score</Label>
                          <Input
                            value={currentTest.speakingScore}
                            onChange={(e) => setCurrentTest({ ...currentTest, speakingScore: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Overall Score</Label>
                      <Input
                        value={currentTest.overallScore}
                        onChange={(e) => setCurrentTest({ ...currentTest, overallScore: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleAddTest} className="w-full">
                      Add Test
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {englishTests.length > 0 && (
              <div className="space-y-2">
                {englishTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{test.testType}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.testDate} • Overall: {test.overallScore}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEnglishTests(englishTests.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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