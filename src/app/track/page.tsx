"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Search,
  XCircle,
} from "lucide-react";

import { siteRoutes } from "@/constants/site-routes";
import studentService from "@/service/student.service";

type ApplicationStatus =
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | null;

interface TrackApplicationResponse {
  id: string;
  generated_stud_id?: string | null;
  course_name: string | null;
  application_status: string;
  current_stage: string;
  submitted_at: string | null;
  decision_at: string | null;
  next_steps: string[];
  assigned_staff_email: string | null;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const normalizeStatus = (
  status: string | null,
  stage: string | null
): ApplicationStatus => {
  const value = `${status ?? ""} ${stage ?? ""}`.toLowerCase();
  if (value.includes("submitted")) return "submitted";
  if (value.includes("review")) return "under-review";
  if (
    value.includes("approved") ||
    value.includes("accepted") ||
    value.includes("offer")
  )
    return "approved";
  if (
    value.includes("rejected") ||
    value.includes("declined") ||
    value.includes("not successful")
  )
    return "rejected";
  return null;
};

const getStatusConfig = (status: ApplicationStatus) => {
  switch (status) {
    case "submitted":
      return {
        icon: FileText,
        text: "Submitted",
        color: "text-primary",
        bg: "bg-primary/10",
        description: "Your application has been received and is pending review",
      };
    case "under-review":
      return {
        icon: Clock,
        text: "Under Review",
        color: "text-secondary-foreground",
        bg: "bg-secondary",
        description:
          "Our admissions team is currently reviewing your application",
      };
    case "approved":
      return {
        icon: CheckCircle2,
        text: "Approved",
        color: "text-foreground",
        bg: "bg-muted",
        description: "Congratulations! Your application has been approved",
      };
    case "rejected":
      return {
        icon: XCircle,
        text: "Not Successful",
        color: "text-destructive",
        bg: "bg-destructive/10",
        description:
          "Unfortunately, your application was not successful at this time",
      };
    default:
      return null;
  }
};

const ApplicationTrack = () => {
  const [applicationId, setApplicationId] = useState("");
  const [trackedApplication, setTrackedApplication] =
    useState<TrackApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!applicationId.trim()) {
      toast.error("Please enter an application ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackedApplication(null);

    try {
      const response = await studentService.trackApplication(
        applicationId.trim()
      );
      if (response.success && response.data) {
        setTrackedApplication(response.data as TrackApplicationResponse);
        toast.success("Status updated");
      } else {
        throw new Error(response.message || "Application not found");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to track";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) handleTrack();
  };

  const statusConfig = trackedApplication
    ? getStatusConfig(
        normalizeStatus(
          trackedApplication.application_status,
          trackedApplication.current_stage
        )
      )
    : null;

  return (
    <div className="size-full min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <Link
          href={siteRoutes.auth.login}
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Back to login options</span>
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto mb-6 h-14 w-64">
            <Image
              src="/images/logo.svg"
              alt="Churchill Institute of Higher Education"
              width={56}
              height={56}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl mb-2 text-foreground">
            Track Your Application
          </h1>
          <p className="text-muted-foreground">
            Enter your details to check your application status
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-6">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-4">
              <label
                htmlFor="applicationId"
                className="block text-sm mb-2 text-foreground"
              >
                Application ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  id="applicationId"
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="e.g., APP2026001234"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="size-5" />
                  Track Application
                </>
              )}
            </button>
          </form>
        </div>

        {error && !trackedApplication && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="size-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-destructive mb-1">
                  Application Not Found
                </h2>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {trackedApplication && (
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="bg-primary p-6 text-primary-foreground">
              <h2 className="text-xl mb-1">Application Details</h2>
              <p className="text-primary-foreground/80 text-sm">
                ID: {trackedApplication.id}
              </p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Student ID
                    </p>
                    <p className="font-semibold text-foreground">
                      {trackedApplication.generated_stud_id || "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Program
                    </p>
                    <p className="font-semibold text-foreground">
                      {trackedApplication.course_name || "Application"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Submitted On
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDate(trackedApplication.submitted_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Last Updated
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDate(trackedApplication.decision_at)}
                    </p>
                  </div>
                </div>
              </div>

              {statusConfig &&
                (() => {
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div className={`${statusConfig.bg} rounded-xl p-6`}>
                      <div className="flex items-start gap-4">
                        <div
                          className={`${statusConfig.color} bg-background rounded-lg p-3`}
                        >
                          <StatusIcon className="size-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`${statusConfig.color} text-xl mb-1`}>
                            {statusConfig.text}
                          </h3>
                          <p className="text-muted-foreground">
                            {statusConfig.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              <div className="mt-6 bg-muted rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Next Steps
                </h3>
                {trackedApplication.next_steps.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {trackedApplication.next_steps.map((step, index) => (
                      <li key={`${step}-${index}`}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You will be notified via email of any updates to your
                    application.
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-3">
                  If you have any questions, please contact our admissions team
                  at{" "}
                  <a
                    href={`mailto:${
                      trackedApplication.assigned_staff_email ||
                      "admissions@churchill.edu.au"
                    }`}
                    className="text-primary hover:text-primary/90 underline"
                  >
                    {trackedApplication.assigned_staff_email ||
                      "admissions@churchill.edu.au"}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Can&apos;t find your Application ID?{" "}
            <a
              href="mailto:admissions@churchill.edu.au"
              className="text-primary hover:text-primary/90 underline"
            >
              Contact Admissions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTrack;
