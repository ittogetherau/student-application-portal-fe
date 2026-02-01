"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Search,
  User,
  Mail,
} from "lucide-react";

import { siteRoutes } from "@/constants/site-routes";
import { formatUtcToFriendlyLocal } from "@/lib/format-utc-to-local";
import studentService from "@/service/student.service";

/* =========================
   Types
========================= */

type CanonicalStage =
  | "draft"
  | "submitted"
  | "staff_review"
  | "awaiting_documents"
  | "gs_assessment"
  | "offer_generated"
  | "coe"
  | "completed";

interface StageProgress {
  stage: CanonicalStage;
  status: "pending" | "completed" | "current";
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
  generated_stud_id: string | null; // CIHE ID
  tracking_code: string;
  application_status: string;
  current_stage: CanonicalStage;
  completion_percentage: number;
  submitted_at: string | null;
  decision_at: string | null;
  stage_progress: StageProgress[];
  required_documents: RequiredDocument[];
  next_steps: string[];
  assigned_staff_name: string | null;
  assigned_staff_email: string | null;
}

/* =========================
   Constants
========================= */

const STAGE_LABELS: Record<CanonicalStage, string> = {
  draft: "Draft",
  submitted: "Submitted",
  staff_review: "Staff Review",
  awaiting_documents: "Awaiting Documents",
  gs_assessment: "GS Assessment",
  offer_generated: "Offer Generated",
  coe: "COE Processing",
  completed: "Completed",
};

const STAGE_ICONS: Record<CanonicalStage, React.ElementType> = {
  draft: FileText,
  submitted: FileText,
  staff_review: Clock,
  awaiting_documents: Clock,
  gs_assessment: Clock,
  offer_generated: CheckCircle2,
  coe: Clock,
  completed: CheckCircle2,
};

/* =========================
   Page
========================= */

export default function ApplicationTrack() {
  const [applicationId, setApplicationId] = useState("");
  const [data, setData] = useState<TrackApplicationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!applicationId.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await studentService.trackApplication(applicationId.trim());
      if (!res.success || !res.data) {
        throw new Error(res.message || "Application not found");
      }
      setData(res.data as TrackApplicationResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to track application");
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = data ? STAGE_ICONS[data.current_stage] : null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back */}
        <Link
          href={siteRoutes.auth.login}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        {/* Search */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Application ID or Tracking Code"
                className="w-full rounded-md border border-input bg-background py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Searching…" : "Track"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    CIHE Student ID
                  </p>
                  <p className="text-lg font-semibold">
                    {data.generated_stud_id || "Pending"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tracking Code: {data.tracking_code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="text-xl font-semibold">
                    {data.completion_percentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-xl border border-border bg-muted p-6">
              <div className="flex items-start gap-4">
                {StatusIcon && (
                  <StatusIcon className="size-8 text-foreground" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {STAGE_LABELS[data.current_stage]}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data.application_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold">Progress</h3>
              <ul className="space-y-3">
                {data.stage_progress.map((s) => (
                  <li
                    key={s.stage}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{STAGE_LABELS[s.stage]}</span>
                    <span className="text-muted-foreground">
                      {s.status === "completed" && s.completed_at
                        ? formatUtcToFriendlyLocal(s.completed_at)
                        : s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Submitted At</p>
                <p className="font-medium">
                  {data.submitted_at
                    ? formatUtcToFriendlyLocal(data.submitted_at)
                    : "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {data.decision_at
                    ? formatUtcToFriendlyLocal(data.decision_at)
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold">Required Documents</h3>
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="text-left font-normal">Document</th>
                    <th className="text-left font-normal">Requirement</th>
                    <th className="text-left font-normal">Status</th>
                    <th className="text-left font-normal">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {data.required_documents.map((d) => (
                    <tr key={d.name} className="border-t border-border">
                      <td className="py-2">{d.name}</td>
                      <td className="py-2">
                        {d.is_required ? "Required" : "Optional"}
                      </td>
                      <td className="py-2">
                        {d.is_uploaded ? (
                          <span className="text-success">Uploaded</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {d.uploaded_at
                          ? formatUtcToFriendlyLocal(d.uploaded_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Next Steps */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold">Next Steps</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Assigned Staff */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold">Assigned Staff</h3>
              <div className="flex items-center gap-3 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span>{data.assigned_staff_name || "Admissions Team"}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${
                    data.assigned_staff_email || "admissions@churchill.edu.au"
                  }`}
                  className="underline"
                >
                  {data.assigned_staff_email || "admissions@churchill.edu.au"}
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cant find your Application ID?{" "}
              <a
                href="mailto:myit@churchill.edu.au"
                className="text-primary hover:text-primary-foreground transition-all"
                target="_blank"
              >
                Contact Admissions
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
