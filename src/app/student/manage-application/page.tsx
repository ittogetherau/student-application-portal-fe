"use client";

import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui-kit/states";
import NewForm from "@/features/application-form/components/new-form";
import { useApplicationFormDataStore } from "@/features/application-form/store/use-application-form-data.store";
import { useApplicationStepStore } from "@/features/application-form/store/use-application-step.store";
import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import publicStudentApplicationService from "@/service/public-student-application.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryError = Error & {
  response?: {
    status?: number;
  };
};

const ExpiredLinkState = () => (
  <div className="mx-auto flex min-h-[70vh] max-w-xl items-center p-4">
    <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold">Link Expired</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This application link is invalid or has expired. Request a new link to
        continue.
      </p>
      <Button asChild className="mt-6">
        <Link href={siteRoutes.student.root}>Request New Link</Link>
      </Button>
    </div>
  </div>
);

const SubmittedState = ({ trackingCode }: { trackingCode?: string }) => (
  <div className="mx-auto flex min-h-[70vh] max-w-xl items-center p-4">
    <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold">Application Submitted</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This application has already been submitted and can no longer be
        edited.
      </p>
      <Button asChild className="mt-6">
        <Link href={siteRoutes.track.root(trackingCode)}>Track Application</Link>
      </Button>
    </div>
  </div>
);

const StudentManageApplicationContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const applicationIdFromUrl = searchParams.get("id")?.trim() ?? "";
  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData,
  );
  const setApplicationId = useApplicationFormDataStore(
    (state) => state.setApplicationId,
  );
  const resetNavigation = useApplicationStepStore(
    (state) => state.resetNavigation,
  );
  const setSession = usePublicStudentApplicationStore(
    (state) => state.setSession,
  );
  const setStatus = usePublicStudentApplicationStore(
    (state) => state.setStatus,
  );
  const resetPublicSession = usePublicStudentApplicationStore(
    (state) => state.reset,
  );

  useEffect(() => {
    clearAllData();
    resetNavigation();

    if (token) {
      setSession({ token, status: "validating" });
    } else {
      setStatus("expired");
    }

    return () => {
      resetPublicSession();
    };
  }, [
    clearAllData,
    resetNavigation,
    resetPublicSession,
    setSession,
    setStatus,
    token,
  ]);

  const openQuery = useQuery({
    queryKey: ["public-student-application-open", token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response =
        await publicStudentApplicationService.openApplication(token);
      if (!response.success) {
        const error = new Error(response.message) as QueryError;
        error.response = { status: response.status };
        throw error;
      }
      return response.data;
    },
  });
  const openPayload = openQuery.data;
  const validatedApplicationId =
    typeof openPayload?.application_id === "string"
      ? openPayload.application_id
      : "";
  const isTokenValidated =
    openQuery.isSuccess &&
    openPayload?.valid !== false &&
    validatedApplicationId.length > 0;
  const validatedTrackingCode =
    typeof openPayload?.tracking_code === "string"
      ? openPayload.tracking_code
      : "";
  const isSubmittedStage =
    typeof openPayload?.current_stage === "string" &&
    openPayload.current_stage.toLowerCase() === "submitted";
  const isUrlSyncedWithValidatedApplication =
    !!validatedApplicationId && applicationIdFromUrl === validatedApplicationId;

  useEffect(() => {
    if (!token) return;

    if (openQuery.isSuccess) {
      const resolvedApplicationId = validatedApplicationId || null;
      const isOpenValid =
        openQuery.data?.valid !== false && !!resolvedApplicationId;

      if (!isOpenValid) {
        setStatus("expired");
        return;
      }

      setSession({
        token,
        applicationId: resolvedApplicationId,
        trackingCode: validatedTrackingCode || null,
        status: "ready",
        expiresAt: openQuery.data?.expires_at ?? null,
        studentEmail:
          typeof openQuery.data?.student_email === "string"
            ? openQuery.data.student_email
            : null,
        submittedByStudent:
          typeof openQuery.data?.submitted_by_student === "boolean"
            ? openQuery.data.submitted_by_student
            : null,
      });

      if (resolvedApplicationId) {
        setApplicationId(resolvedApplicationId);

        if (applicationIdFromUrl !== resolvedApplicationId) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("id", resolvedApplicationId);
          router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
          });
        }
      }

      return;
    }

    if (openQuery.isError) {
      const status = (openQuery.error as QueryError).response?.status;
      setStatus(status === 400 ? "expired" : "idle");
    }
  }, [
    applicationIdFromUrl,
    openQuery.data,
    openQuery.error,
    openQuery.isError,
    openQuery.isSuccess,
    pathname,
    router,
    searchParams,
    setApplicationId,
    setSession,
    setStatus,
    token,
    validatedTrackingCode,
    validatedApplicationId,
  ]);

  if (!token) {
    return <ExpiredLinkState />;
  }

  if (openQuery.isPending) {
    return <LoadingState />;
  }

  if (openQuery.isSuccess && !isTokenValidated) {
    return <ExpiredLinkState />;
  }

  if (openQuery.isError) {
    const status = (openQuery.error as QueryError).response?.status;
    if (status === 400) {
      return <ExpiredLinkState />;
    }

    return (
      <ErrorState
        title="Unable to open application"
        description={(openQuery.error as Error).message || "Please try again."}
        action={{ label: "Retry", onClick: () => openQuery.refetch() }}
      />
    );
  }

  if (isSubmittedStage) {
    return <SubmittedState trackingCode={validatedTrackingCode} />;
  }

  if (!isUrlSyncedWithValidatedApplication) {
    return <LoadingState />;
  }

  return (
    <div className="p-4">
      <NewForm
        backHref={siteRoutes.student.root}
        title="Manage Application"
        description="Complete the form below to update and submit your application."
        publicMode={true}
      />
    </div>
  );
};

const StudentManageApplicationPage = () => (
  <Suspense fallback={<LoadingState />}>
    <StudentManageApplicationContent />
  </Suspense>
);

export default StudentManageApplicationPage;
