"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import studentService from "@/service/student.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  generated_stud_id: string | null;
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

const TRACKING_CODE_REGEX = /^[A-Z]{3}\d{4}$/;

function ApplicationTrackContent() {
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState("");
  const [data, setData] = useState<TrackApplicationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAutoSubmittedTid = useRef<string | null>(null);

  const trackById = useCallback(async (id: string) => {
    const trackingId = id.trim().toUpperCase();
    if (!trackingId) {
      setError("Enter your tracking code.");
      setData(null);
      return;
    }

    if (!TRACKING_CODE_REGEX.test(trackingId)) {
      setError("Tracking code must be 3 letters followed by 4 digits.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await studentService.trackApplication(trackingId);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Application not found");
      }
      setData(res.data as TrackApplicationResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to track application");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTrack = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const trackingId = applicationId.trim().toUpperCase();
      setApplicationId(trackingId);
      void trackById(trackingId);
    },
    [applicationId, trackById],
  );

  useEffect(() => {
    const tid = searchParams.get("tid")?.trim();
    if (!tid || lastAutoSubmittedTid.current === tid) return;

    lastAutoSubmittedTid.current = tid;
    const normalizedTid = tid.toUpperCase();
    setApplicationId(normalizedTid);
    void trackById(normalizedTid);
  }, [searchParams, trackById]);

  const StatusIcon = data ? STAGE_ICONS[data.current_stage] : null;
  const requiredDocuments =
    data?.required_documents.filter(
      (d) => d.name.trim().toLowerCase() !== "signed offer letter",
    ) ?? [];

  return (
    <div className="min-h-screen bg-muted/30 px-6 py-10">
      <Link
        href={siteRoutes.auth.login}
        className="fixed left-4 top-4 z-10 inline-flex items-center gap-2 rounded-md border border-border bg-background/90 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="mx-auto max-w-5xl pt-12">
        <div
          className={
            data
              ? "space-y-8"
              : "flex min-h-[calc(100vh-8rem)] flex-col justify-center"
          }
        >
          {!data ? (
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                  <Link href={siteRoutes.home} className="mx-auto block w-fit">
                    <Image
                      src="/images/logo.svg"
                      alt="Churchill Institute of Higher Education"
                      width={160}
                      height={64}
                      className="h-auto w-40"
                      priority
                    />
                  </Link>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">Track Application</CardTitle>
                    <CardDescription>
                      Enter your application ID or tracking code to check your
                      application status.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleTrack}>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tracking Code</p>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={applicationId}
                          onChange={(e) => {
                            setApplicationId(e.target.value.toUpperCase());
                            if (error) {
                              setError(null);
                            }
                          }}
                          placeholder="ABC1234"
                          className="h-10 pl-9"
                          disabled={loading}
                          maxLength={7}
                        />
                      </div>
                    </div>

                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Searching..." : "Track Application"}
                    </Button>

                    <p className="text-sm text-muted-foreground">
                      Haven&apos;t created an application yet?{" "}
                      <Link
                        href={siteRoutes.student.root}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Create now
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {data ? (
            <>
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
                  {requiredDocuments.map((d) => (
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
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold">Next Steps</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

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
              Can&apos;t find your Application ID?{" "}
              <a
                href="mailto:myit@churchill.edu.au"
                className="text-primary transition-all hover:text-primary-foreground"
                target="_blank"
              >
                Contact Admissions
              </a>
            </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationTrack() {
  return (
    <Suspense fallback={null}>
      <ApplicationTrackContent />
    </Suspense>
  );
}
