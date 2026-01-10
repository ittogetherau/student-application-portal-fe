"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import studentService from "@/service/student.service";
import {
  AlertCircle,
  Check,
  Clock,
  FileCheck,
  Mail,
  Search,
  User,
  GraduationCap,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Globe,
  Hash
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface StageProgress {
  stage: string;
  status: "completed" | "pending" | "in_progress";
  completed_at: string | null;
  duration_days: number | null;
}

interface RequiredDocument {
  name: string;
  is_required: boolean;
  is_uploaded: boolean;
  uploaded_at: string | null;
  needs_attention: boolean;
}

interface TrackApplicationResponse {
  id: string;
  generated_stud_id?: string | null;
  course_code: string | null;
  course_name: string | null;
  intake: string | null;
  campus: string | null;
  tuition_fee: number | null;
  application_status: string;
  current_stage: string;
  completion_percentage: number;
  submitted_at: string | null;
  decision_at: string | null;
  stage_progress: StageProgress[];
  required_documents: RequiredDocument[];
  timeline: unknown[];
  agent_name: string | null;
  agent_agency: string | null;
  agent_phone: string | null;
  assigned_staff_name: string | null;
  assigned_staff_email: string | null;
  next_steps: string[];
}

const STAGE_MAPPING: Record<string, { title: string; color: string }> = {
  draft: { title: "Draft", color: "bg-slate-100 text-slate-600" },
  submitted: { title: "Submitted", color: "bg-blue-50 text-blue-600" },
  staff_review: { title: "Under Review", color: "bg-amber-50 text-amber-600" },
  awaiting_documents: { title: "Action Required", color: "bg-rose-50 text-rose-600" },
  gs_assessment: { title: "GS Check", color: "bg-indigo-50 text-indigo-600" },
  offer_generated: { title: "Offer Ready", color: "bg-emerald-50 text-emerald-600" },
  offer_accepted: { title: "Accepted", color: "bg-green-50 text-green-700" },
  enrolled: { title: "Enrolled", color: "bg-primary/10 text-primary" },
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const ApplicationTrack = () => {
  const [applicationId, setApplicationId] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<TrackApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!applicationId.trim()) {
      toast.error("Please enter an application ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await studentService.trackApplication(applicationId.trim());
      if (response.success && response.data) {
        setTrackedApplication(response.data as TrackApplicationResponse);
        toast.success("Status updated");
      } else {
        throw new Error(response.message || "Application not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to track";
      setError(errorMessage);
      toast.error(errorMessage);
      setTrackedApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) handleTrack();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-12">
      {/* Search Header - Minimal & Integrated */}
      <div className={cn(
        "w-full border-b bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300",
        trackedApplication ? "py-4" : "py-16 sm:py-24"
      )}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className={cn(
            "flex flex-col gap-6",
            trackedApplication ? "lg:flex-row lg:items-center lg:justify-between" : "items-center text-center"
          )}>
            <div className={cn(
              "space-y-1",
              trackedApplication ? "text-center lg:text-left" : "text-center"
            )}>
              <h1 className={cn(
                "font-semibold tracking-tight text-slate-900 dark:text-white transition-all",
                trackedApplication ? "text-lg sm:text-xl" : "text-3xl sm:text-4xl"
              )}>
                {trackedApplication ? "Application Status" : "Track Application"}
              </h1>
              {!trackedApplication && (
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Enter your unique application reference ID to view your progress.
                </p>
              )}
            </div>

            <div className={cn(
              "flex flex-col sm:flex-row w-full gap-2 transition-all mx-auto lg:mx-0",
              trackedApplication ? "max-w-md" : "max-w-xl"
            )}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Reference ID..."
                  className="pl-9 h-10 w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-none ring-0 focus-visible:ring-1 focus-visible:ring-slate-300"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleTrack}
                disabled={isLoading || !applicationId.trim()}
                className="h-10 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 text-white shadow-none shrink-0"
              >
                {isLoading ? "Searching..." : "Track Status"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && !trackedApplication && (
        <div className="container mx-auto px-4 max-w-xl mt-8">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {trackedApplication && (
        <main className="container mx-auto px-4 max-w-5xl mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">

              {/* Core Information Card */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-none rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                        <Hash className="size-3" />
                        <span className="font-mono">Ref: {trackedApplication.id}</span>
                        {trackedApplication.submitted_at && (
                          <>
                            <span className="text-slate-200 hidden sm:inline">•</span>
                            <span>{formatDate(trackedApplication.submitted_at)}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                        {trackedApplication.course_name || "Application Details"}
                      </h2>
                    </div>
                    <Badge variant="secondary" className={cn(
                      "px-3 py-1 text-[11px] font-bold border-none rounded-lg w-fit",
                      STAGE_MAPPING[trackedApplication.current_stage]?.color || "bg-slate-100"
                    )}>
                      {trackedApplication.application_status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-6">
                  {/* Dense Stats Grid - Responsive columns */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono tracking-tight">{trackedApplication.generated_stud_id || "PENDING"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Code</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{trackedApplication.course_code || "TBA"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intake</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{trackedApplication.intake || "TBA"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campus</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{trackedApplication.campus || "TBA"}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Progress Tracker</span>
                      <span className="text-slate-900 dark:text-white">{trackedApplication.completion_percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${trackedApplication.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journey Timeline - Minimal List */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-none rounded-2xl bg-white dark:bg-slate-900 text-left">
                <CardHeader className="p-5 sm:p-6 pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClipboardList className="size-4 text-slate-400" />
                    Application Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <div className="space-y-0 relative border-l border-slate-100 dark:border-slate-800 ml-2">
                    {trackedApplication.stage_progress.map((stage, index) => {
                      const isCompleted = stage.status === "completed";
                      const isCurrent = stage.stage === trackedApplication.current_stage;

                      return (
                        <div key={stage.stage} className="relative pl-7 pb-8 last:pb-2">
                          <div className={cn(
                            "absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2",
                            isCompleted ? "bg-slate-900 border-slate-900 dark:bg-primary dark:border-primary" :
                              isCurrent ? "bg-white border-slate-900 dark:bg-slate-950 dark:border-primary ring-4 ring-slate-100 dark:ring-slate-800" :
                                "bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn(
                              "text-sm font-semibold tracking-tight",
                              isCompleted || isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400"
                            )}>
                              {STAGE_MAPPING[stage.stage]?.title || stage.stage.replace(/_/g, " ").toUpperCase()}
                            </h4>
                            {isCompleted && stage.completed_at && (
                              <p className="text-[11px] text-slate-400 font-medium">Completed: {formatDate(stage.completed_at)}</p>
                            )}
                            {isCurrent && (
                              <p className="text-xs text-slate-500 max-w-lg mt-1.5 leading-relaxed">This is the current status of your application. Our admissions team is currently processing your data.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>


              {/* Next Actions - Moved to Sidebar for balance */}
              <Card className="border border-slate-900 bg-slate-900 dark:border-slate-800 dark:bg-slate-800 text-white rounded-2xl shadow-none text-left">
                <CardHeader className="p-5 pb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-400">
                    <ArrowRight className="size-3" />
                    Next Steps
                  </h3>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <ul className="space-y-4">
                    {trackedApplication.next_steps.length > 0 ? (
                      trackedApplication.next_steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-slate-200">
                          <span className="text-slate-500 font-mono mt-0.5 shrink-0">0{i + 1}</span>
                          {step}
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No pending actions...</p>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Contact/Support - Responsive Stacking */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Agent</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Globe className="size-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {trackedApplication.agent_agency || trackedApplication.agent_name || "Direct Application"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">Authorized partner Representative</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-xs font-semibold border-slate-200 dark:border-slate-800 shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    asChild
                  >
                    <a href={`mailto:${trackedApplication.assigned_staff_email || 'admissions@churchill.edu'}`}>
                      <Mail className="size-3.5 mr-2.5 text-slate-400" />
                      Email Staff
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-xs font-semibold border-slate-200 dark:border-slate-800 shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MessageSquare className="size-3.5 mr-2.5 text-slate-400" />
                    Live Support
                  </Button>
                </div>
              </div>

            </div>

            {/* Sidebar Area */}
            <div className="lg:col-span-4 space-y-8">

              {/* Document Status */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-none rounded-2xl bg-white dark:bg-slate-900 text-left overflow-hidden">
                <CardHeader className="p-5 pb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileCheck className="size-4 text-slate-400" />
                    Documents
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                    {trackedApplication.required_documents.map((doc, i) => (
                      <div key={i} className="p-4 flex items-center justify-between gap-4 text-left">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{doc.name}</p>
                          <span className={cn(
                            "text-[10px] uppercase font-bold tracking-wider",
                            doc.is_required ? "text-rose-500" : "text-slate-400"
                          )}>
                            {doc.is_required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <div className="shrink-0">
                          {doc.is_uploaded ? (
                            <div className="size-6 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center">
                              <Check className="size-3.5" />
                            </div>
                          ) : (
                            <div className="size-6 text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                              <Clock className="size-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default ApplicationTrack;
