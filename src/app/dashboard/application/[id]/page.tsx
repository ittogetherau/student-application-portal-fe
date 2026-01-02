"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Clock,
  Loader2,
  CloudCog,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  UserCheck,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { useApplicationGetQuery } from "@/hooks/useApplication.hook";
import { useApplicationDocumentsQuery } from "@/hooks/document.hook";
import { siteRoutes } from "@/constants/site-routes";

export default function AgentApplicationDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useApplicationGetQuery(id);
  const { data: documentsResponse, isLoading: isDocumentsLoading } =
    useApplicationDocumentsQuery(id);

  const application = response?.data;
  const documents = documentsResponse?.data || [];

  console.log(documents), "documents";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <CloudCog className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-medium">Error Loading Application</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          {(error as Error)?.message ||
            "Something went wrong while fetching the application details."}
        </p>
        <Button
          onClick={() =>
            router.push(siteRoutes.dashboard.applicationQueue.root)
          }
          className="mt-6"
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Application Not Found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          The application you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button
          onClick={() =>
            router.push(siteRoutes.dashboard.applicationQueue.root)
          }
          className="mt-6"
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const studentName =
    application.personal_details?.given_name &&
    application.personal_details?.family_name
      ? `${application.personal_details.given_name} ${application.personal_details.family_name}`
      : "N/A";

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(siteRoutes.dashboard.applicationQueue.root)
            }
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium">{studentName}</h1>
            <p className="text-xs text-muted-foreground">
              Reference: {application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={application.current_stage} />
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sticky Sidebar */}
        <aside className="lg:col-span-1 sticky top-4 space-y-4 h-fit">
          {/* Application overview */}
          <Card className="shadow-sm border-muted/60 p-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Application Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-4">
              <div className="grid gap-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Student Email
                    </p>
                    <p className="text-sm">
                      {application.personal_details?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Phone
                    </p>
                    <p className="text-sm">
                      {application.personal_details?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Course
                    </p>
                    <p
                      className="text-sm wrap-break-word leading-tight"
                      title={application.course_offering_id || ""}
                    >
                      {application.course_offering_id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Destination
                    </p>
                    <p className="text-sm">
                      {application.personal_details?.country || "Australia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Intake
                    </p>
                    <p
                      className="text-sm truncate"
                      title={application.assigned_staff_id || ""}
                    >
                      February 2025
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Assigned Staff
                    </p>
                    <p
                      className="text-sm truncate"
                      title={application.assigned_staff_id || ""}
                    >
                      {application.assigned_staff_id || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Submitted
                    </p>
                    <p className="text-sm">
                      {formatDate(application.submitted_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {formatDate(application.submitted_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Current Stage
                    </p>
                    <p className="text-sm">N/A</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs for different sections */}
          <Tabs defaultValue="documents" className="space-y-3">
            <div className="flex items-center justify-between">
              <TabsList className="h-9">
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

              <Button size="sm" className="h-9 text-xs">
                Request Cover letter
              </Button>
            </div>

            <TabsContent value="documents" className="space-y-3">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">
                    Application Documents
                  </CardTitle>
                  <CardDescription className="text-xs">
                    All documents submitted with this application
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {isDocumentsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No documents found for this application
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-background rounded-md border text-muted-foreground">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[150px] lg:max-w-xs">
                                {doc.document_type_name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span>{formatBytes(doc.file_size_bytes)}</span>
                                <span>•</span>
                                <Badge
                                  variant={
                                    doc.status === "approved"
                                      ? "default"
                                      : doc.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="h-4 text-[9px] px-1 font-medium uppercase"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.view_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                asChild
                                title="View"
                              >
                                <a
                                  href={doc.view_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            {doc.download_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary"
                                asChild
                                title="Download"
                              >
                                <a href={doc.download_url} download>
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">
                    Application Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-primary" />
                        </div>
                        <div className="w-px flex-1 bg-border mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm font-medium">
                          Application Created
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Application was created in the system.
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDate(application.created_at)}
                        </p>
                      </div>
                    </div>
                    {application.submitted_at && (
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Application Submitted
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Application was submitted for review.
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDate(application.submitted_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gs-documents" className="space-y-3">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">GS Documents</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No GS documents uploaded yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-3">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">
                    Communication History
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No messages yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
