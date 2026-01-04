"use client";

import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteRoutes } from "@/constants/site-routes";
import { USER_ROLE } from "@/constants/types";
import { useApplicationDocumentsQuery } from "@/hooks/document.hook";
import { useApplicationGetQuery } from "@/hooks/useApplication.hook";
import { ArrowLeft, Plus, SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ReviewForm from "../create/_forms/review-form";
import ApplicationSidebar from "./_components/ApplicationSidebar";
import ApplicationStage from "./_components/ApplicationStage";
import CreateThreadForm from "./_components/forms/CreateThreadForm";
import ThreadMessagesPanel from "./_components/panels/thread-messages-panel";
import {
  EmptyTab,
  ErrorState,
  LoadingState,
  NotFoundState,
} from "./_components/states";
import CommunicationTab from "./_components/tabs/CommunicationTab";
import DocumentsTab, { Document } from "./_components/tabs/DocumentsTab";
import Timeline from "./_components/tabs/TimelineTab";

export default function AgentApplicationDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);

  const { data: session } = useSession();
  const ROLE = session?.user.role;
  const IS_ADMIN_STAFF = session?.user.staff_admin;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useApplicationGetQuery(id);

  const { data: documentsResponse, isLoading: isDocumentsLoading } =
    useApplicationDocumentsQuery(id);

  const application = response?.data;
  const documents = (documentsResponse?.data || []) as Document[];

  const handleBackNavigation = () =>
    router.push(siteRoutes.dashboard.application.root);

  if (isLoading) return <LoadingState />;
  if (isError)
    return <ErrorState error={error as Error} onBack={handleBackNavigation} />;
  if (!application) return <NotFoundState onBack={handleBackNavigation} />;

  const studentName = () => {
    const given = application.personal_details?.given_name;
    const family = application.personal_details?.family_name;
    return given && family ? `${given} ${family}` : "N/A";
  };

  return (
    <>
      <ThreadMessagesPanel />

      <div className="space-y-4 ">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-medium truncate">
                {studentName()}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Reference: {application.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            {/* Badge */}
            <ApplicationStatusBadge status={application.current_stage} />

            {/* Edit */}
            {ROLE === "agent" && (
              <Button asChild variant="outline" size="sm" className="gap-2 h-8">
                <Link
                  href={`${siteRoutes.dashboard.application.create}?id=${application.id}`}
                >
                  <SquarePen className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:sticky lg:top-4 lg:self-start space-y-4">
            {ROLE != "agent" && <ApplicationStage id={id} />}

            <ApplicationSidebar
              current_role={ROLE}
              is_admin_staff={IS_ADMIN_STAFF}
              application={application}
            />
          </aside>

          {/* Main */}
          <main className="min-w-0 space-y-4">
            <Tabs defaultValue="documents" className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="w-full sm:w-auto flex flex-wrap justify-start">
                  <TabsTrigger value="details" className="text-xs px-3">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs px-3">
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs px-3">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="gs-documents" className="text-xs px-3">
                    GS Documents
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="text-xs px-3">
                    Communication
                  </TabsTrigger>
                </TabsList>

                {/* Right action: render outside TabsContent so it doesn't shift layout */}
                {ROLE === USER_ROLE.STAFF && (
                  <Button
                    size="sm"
                    className="h-9 w-full sm:w-auto gap-2"
                    onClick={() => setIsCreateThreadOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Thread
                  </Button>
                )}
              </div>

              <TabsContent value="details" className="space-y-3">
                <ReviewForm
                  applicationId={application.id}
                  showDetails={false}
                />
              </TabsContent>

              <TabsContent value="documents" className="space-y-3">
                <DocumentsTab
                  documents={documents}
                  isLoading={isDocumentsLoading}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-3">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">
                      Application Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <Timeline id={application.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gs-documents" className="space-y-3">
                <EmptyTab
                  title="GS Documents"
                  message="No GS documents uploaded yet"
                />
              </TabsContent>

              <TabsContent value="communication" className="space-y-3">
                <CommunicationTab applicationId={application.id} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={isCreateThreadOpen}
        onOpenChange={(open) => setIsCreateThreadOpen(open)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Communication Thread</DialogTitle>
          </DialogHeader>

          <CreateThreadForm
            applicationId={application.id}
            onSuccess={() => setIsCreateThreadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
