"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useApplicationChangeStageMutation,
  useApplicationGenerateOfferLetterMutation,
  useApplicationGetQuery,
} from "@/hooks/useApplication.hook";
import { APPLICATION_STAGE } from "@/constants/types";
import { Check, FileCheck, Loader2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface ApplicationStageProps {
  id: string;
}

const ApplicationStage = ({ id }: ApplicationStageProps) => {
  // Dialog states
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);

  // Offer letter form fields
  const [courseStartDate, setCourseStartDate] = useState("");
  const [tuitionFee, setTuitionFee] = useState<number>(0);
  const [materialFee, setMaterialFee] = useState<number>(0);
  const [offerConditions, setOfferConditions] = useState<string[]>([
    "Payment of tuition fees as per payment plan",
    "Provision of certified copies of all academic transcripts and certificates",
    "Valid student visa (for international students)",
    "Overseas Student Health Cover (OSHC) for the duration of the course",
    "Compliance with the RTO's policies and code of conduct",
  ]);
  const [newCondition, setNewCondition] = useState("");

  // Queries & Mutations
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const generateOfferLetter = useApplicationGenerateOfferLetterMutation(id);

  const application = response?.data;

  // Handlers
  const handleStartReview = (toStage: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: toStage },
      {
        onSuccess: () => {
          toast.success(`Moved to ${toStage.replace("_", " ")}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to change stage");
        },
      }
    );
  };

  const handleGenerateOfferLetter = () => {
    if (!courseStartDate) {
      toast.error("Please enter a course start date");
      return;
    }

    generateOfferLetter.mutate(
      {
        course_start_date: courseStartDate,
        tuition_fee: tuitionFee,
        material_fee: materialFee,
        conditions: offerConditions,
        template: "standard",
      },
      {
        onSuccess: (data) => {
          toast.success("Offer letter generated successfully!");
          // if (data.pdf_url) {
          //   window.open(data.pdf_url, "_blank");
          // }
          setShowOfferLetterDialog(false);
          setCourseStartDate("");
          setTuitionFee(0);
          setMaterialFee(0);
          handleStageChnage("gs_assessment")
        },
        onError: (error) => {
          toast.error(error.message || "Failed to generate offer letter");
        },
      }
    );
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setOfferConditions([...offerConditions, newCondition.trim()]);
    setNewCondition("");
  };

  const handleDeleteCondition = (index: number) => {
    setOfferConditions(offerConditions.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="space-y-4">
      {application.current_stage === APPLICATION_STAGE.SUBMITTED ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start Review?</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You can start reviewing this application. Click the button below
              to begin.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleStartReview(APPLICATION_STAGE.STAFF_REVIEW)}
              disabled={changeStage.isPending}
              className="w-full"
            >
              {changeStage.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Start Review
            </Button>
          </CardFooter>
        </Card>
      ) : application.current_stage === APPLICATION_STAGE.STAFF_REVIEW ? (
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Confirm Applicant Details</CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <CardDescription>
              You have reviewed the application and confirmed all applicant
              details are accurate and complete. Confirm to move this
              application to the offer letter stage.
            </CardDescription>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button
              onClick={() =>
                handleStartReview(APPLICATION_STAGE.OFFER_GENERATED)
              }
              disabled={changeStage.isPending}
              variant="outline"
              className="w-full"
            >
              {changeStage.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Move to Offer Generated
            </Button>
          </CardFooter>
        </Card>
      ) : application.current_stage === APPLICATION_STAGE.OFFER_GENERATED ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Ready to Generate Offer Letter?
            </CardTitle>
            <CardDescription>
              All documents have been reviewed and synced to Galaxy. You can now
              generate and send the offer letter to the agent and student.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Dialog
              open={showOfferLetterDialog}
              onOpenChange={setShowOfferLetterDialog}
            >
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Generate Offer Letter
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Offer Letter</DialogTitle>
                  <DialogDescription>
                    Fill in the offer details below. A professional PDF offer
                    letter will be generated and sent to the agent and student.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseStartDate">Course Start Date *</Label>
                    <Input
                      id="courseStartDate"
                      type="date"
                      value={courseStartDate}
                      onChange={(e) => setCourseStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tuitionFee">Tuition Fee (AUD) *</Label>
                    <Input
                      id="tuitionFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tuitionFee}
                      onChange={(e) =>
                        setTuitionFee(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Enter tuition fee amount"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="materialFee">Material Fee (AUD)</Label>
                    <Input
                      id="materialFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={materialFee}
                      onChange={(e) =>
                        setMaterialFee(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Enter material fee amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Offer Conditions</Label>
                    <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                      {offerConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 group"
                        >
                          <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                          <p className="text-sm flex-1">{condition}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteCondition(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Input
                          placeholder="Add a new condition..."
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCondition();
                            }
                          }}
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={handleAddCondition}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manage the conditions that will be included in the letter.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materialFee">Offer letter</Label>
                  <Input
                    id="offerLetter"
                    type="file"
                    placeholder="Upload  Custom Offer Letter"
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowOfferLetterDialog(false)}
                    disabled={generateOfferLetter.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateOfferLetter}
                    disabled={generateOfferLetter.isPending}
                  >
                    {generateOfferLetter.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Generate Offer Letter
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ApplicationStage;
