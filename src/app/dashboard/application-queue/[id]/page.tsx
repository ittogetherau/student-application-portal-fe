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
  Activity,
  PlayCircle,
  User,
  Users,
  ChevronsUpDown,
  Check,
  CheckCircle,
  XCircle,
  Send,
  FileCheck,
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
import {
  useApplicationGetQuery,
  useApplicationAssignMutation,
  useApplicationApproveMutation,
  useApplicationRejectMutation,
  useApplicationGenerateOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import { useApplicationDocumentsQuery } from "@/hooks/document.hook";
import { toast } from "react-hot-toast";
import { siteRoutes } from "@/constants/site-routes";
import { useSession } from "next-auth/react";
import { Popover } from "../../../../../Student Application Management System (3)/src/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { Role, User as AppUser } from "@/constants/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Real Staff Users from Database
export const staffUsers: AppUser[] = [
  {
    id: "65650ddc-5818-4d06-9f6d-3ab21512e9d4",
    email: "staff@churchill.com",
    name: "Churchill Staff",
    role: Role.STAFF_REVIEWER,
    staffId: "STAFF001",
    createdAt: "2025-12-09T15:34:54.845800",
    updatedAt: "2025-12-09T15:35:05.424387",
  },
  {
    id: "757be32e-3de8-4ca7-bb98-835629db5881",
    email: "staff@cihe.com",
    name: "CIHE Staff",
    role: Role.STAFF_REVIEWER,
    staffId: "STAFF002",
    createdAt: "2026-01-01T07:04:39.540462",
    updatedAt: "2026-01-01T07:04:46.073049",
  },
  {
    id: "a5d641b2-fe11-44a8-ab68-eab139e4b6ce",
    email: "test@staff.com",
    name: "Test Staff",
    role: Role.STAFF_ADMIN,
    staffId: "STAFF003",
    createdAt: "2025-12-02T14:57:42.543373",
    updatedAt: "2026-01-01T07:29:07.530161",
  },
  {
    id: "f2c3c1ce-77c7-4703-9efb-16fece3b786e",
    email: "stff@itt.com",
    name: "ITT Staff",
    role: Role.STAFF_REVIEWER,
    staffId: "STAFF004",
    createdAt: "2025-11-26T10:44:54.310625",
    updatedAt: "2025-11-26T10:44:54.310630",
  },
  {
    id: "074c8183-386e-4d8c-a6dd-ae4e8aadeba3",
    email: "exam@churchill.edu.au",
    name: "Churchill Exam Officer",
    role: Role.STAFF_ADMIN,
    staffId: "STAFF005",
    createdAt: "2025-12-04T06:55:04.945940",
    updatedAt: "2025-12-04T06:55:04.945946",
  },
  {
    id: "2e3a8ad9-d5e5-4f5a-92cf-fcd782ba877f",
    email: "staff@test.com",
    name: "General Staff",
    role: Role.STAFF_REVIEWER,
    staffId: "STAFF006",
    createdAt: "2025-12-02T23:59:46.860382",
    updatedAt: "2026-01-01T06:38:44.326524",
  },
  {
    id: "a0504207-6d1b-4480-a9bc-5c68684806b6",
    email: "om@ittogether.com.au",
    name: "IT Together Operations",
    role: Role.SUPER_ADMIN,
    staffId: "STAFF007",
    createdAt: "2025-12-26T09:15:10.828391",
    updatedAt: "2026-01-01T06:45:35.150339",
  },
];

// Get all active staff users
export const getStaffUsers = (): AppUser[] => {
  return staffUsers;
};

// Map staff users to display format with departments
export const mockStaffMembers = staffUsers.map((user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  email: user.email,
  department:
    user.role === Role.SUPER_ADMIN
      ? "Administration"
      : user.role === Role.STAFF_ADMIN
        ? "Admissions"
        : "Document Review",
}));

export default function AgentApplicationDetail() {
  const [openStaffCombobox, setOpenStaffCombobox] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isAppealable, setIsAppealable] = useState(false);

  // Offer letter form fields
  const [courseStartDate, setCourseStartDate] = useState("");
  const [tuitionFee, setTuitionFee] = useState<number>(0);
  const [materialFee, setMaterialFee] = useState<number>(0);
  const [offerConditions] = useState<string[]>([
    "Payment of tuition fees as per payment plan",
    "Provision of certified copies of all academic transcripts and certificates",
    "Valid student visa (for international students)",
    "Overseas Student Health Cover (OSHC) for the duration of the course",
    "Compliance with the RTO's policies and code of conduct"
  ]);

  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useApplicationGetQuery(id);
  const { data: documentsResponse, isLoading: isDocumentsLoading } =
    useApplicationDocumentsQuery(id);

  const assignMutation = useApplicationAssignMutation(id);
  const approveMutation = useApplicationApproveMutation(id);
  const rejectMutation = useApplicationRejectMutation(id);
  const generateOfferLetterMutation = useApplicationGenerateOfferLetterMutation(id);

  const application = response?.data;
  const documents = documentsResponse?.data || [];

  const handleAssignStaff = (staffId: string | null) => {
    assignMutation.mutate(staffId, {
      onSuccess: () => {
        const staffMember = staffId
          ? mockStaffMembers.find(s => s.id === staffId)
          : null;

        if (staffId) {
          toast.success(`Application assigned to ${staffMember?.name || 'staff member'}`);
        } else {
          toast.success("Application has been unassigned");
        }
        setOpenStaffCombobox(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to assign staff member. Please try again.");
      },
    });
  };

  const handleApprove = () => {
    approveMutation.mutate(
      {
        offer_details: {},
        notes: approvalNotes || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success("Application approved successfully!");
          setShowApproveDialog(false);
          setApprovalNotes("");
          // Show offer letter dialog after approval
          setShowOfferLetterDialog(true);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to approve application");
        },
      }
    );
  };

  const handleGenerateOfferLetter = () => {
    if (!courseStartDate) {
      toast.error("Please enter a course start date");
      return;
    }

    generateOfferLetterMutation.mutate(
      {
        course_start_date: courseStartDate,
        tuition_fee: tuitionFee,
        material_fee: materialFee,
        conditions: offerConditions,
        template: "standard",
      },
      {
        onSuccess: (data) => {
          toast.success("Offer letter generated and sent successfully!");
          setShowOfferLetterDialog(false);
          setCourseStartDate("");
          setTuitionFee(0);
          setMaterialFee(0);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to generate offer letter");
        },
      }
    );
  };

  const handleReject = () => {
    if (rejectionReason.length < 10) {
      toast.error("Rejection reason must be at least 10 characters");
      return;
    }
    if (rejectionReason.length > 1000) {
      toast.error("Rejection reason must be less than 1000 characters");
      return;
    }

    rejectMutation.mutate(
      {
        rejection_reason: rejectionReason,
        is_appealable: isAppealable,
      },
      {
        onSuccess: (data) => {
          toast.success("Application rejected successfully");
          setShowRejectDialog(false);
          setRejectionReason("");
          setIsAppealable(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reject application");
        },
      }
    );
  };

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

  // Build full S3 URL for document access
  const buildDocumentUrl = (relativePath: string | null) => {
    if (!relativePath) return null;

    // Get the API base URL from environment
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    // If the path is already a full URL, return it as-is
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return relativePath;
    }

    // Construct the full URL: API_BASE_URL/documents/VIEW_OR_DOWNLOAD/path
    // The backend should handle serving the S3 files
    return `${apiBaseUrl}/documents/view/${relativePath}`;
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
          <ApplicationStatusBadge status={"received"} />
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sticky Sidebar */}
        <aside className="lg:col-span-1 sticky top-4 space-y-4 h-fit">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Review Decision</CardTitle>
              <CardDescription className="text-foreground">
                Review all documents and application details before making a decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={approveMutation.isPending}
                className="gap-2 w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                {approveMutation.isPending ? "Approving..." : "Approve Application"}
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={rejectMutation.isPending}
                variant="destructive"
                className="gap-2 w-full"
              >
                <XCircle className="h-4 w-4" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
              </Button>
            </CardContent>
          </Card>
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
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Agent
                    </p>
                    <p
                      className="text-sm truncate"
                      title={application.assigned_staff_id || ""}
                    >
                      Current Agent
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Assigned To
                    </p>
                    <Popover
                      open={openStaffCombobox}
                      onOpenChange={setOpenStaffCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openStaffCombobox}
                          className="w-full h-8 justify-between text-sm"
                        >
                          {application.assignedStaffId ? (
                            (() => {
                              const staff = mockStaffMembers.find(
                                (s) => s.id === application.assignedStaffId
                              );
                              return staff
                                ? staff.name
                                : "Select staff member...";
                            })()
                          ) : (
                            <span className="text-foreground">Unassigned</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search by name or email..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No staff member found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="unassigned"
                                onSelect={() => {
                                  handleAssignStaff(null);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${!application.assignedStaffId
                                    ? "opacity-100"
                                    : "opacity-0"
                                    }`}
                                />
                                <span className="text-foreground">
                                  Unassigned
                                </span>
                              </CommandItem>
                              {mockStaffMembers.map((staff) => (
                                <CommandItem
                                  key={staff.id}
                                  value={`${staff.name} ${staff.email}`}
                                  onSelect={() => {
                                    handleAssignStaff(staff.id);
                                    setOpenStaffCombobox(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${application.assignedStaffId === staff.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                      }`}
                                  />
                                  <div className="flex flex-col text-foreground">
                                    <span>{staff.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {staff.email || staff.department}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

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
                                  href={buildDocumentUrl(doc.view_url) || "#"}
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
                                <a
                                  href={buildDocumentUrl(doc.download_url) || "#"}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this application? This will generate an offer letter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add any notes about the approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a detailed reason for rejecting this application (10-1000 characters).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={6}
                className={
                  rejectionReason && (rejectionReason.length < 10 || rejectionReason.length > 1000)
                    ? "border-destructive"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                {rejectionReason.length}/1000 characters
                {rejectionReason.length > 0 && rejectionReason.length < 10 && (
                  <span className="text-destructive ml-2">
                    (Minimum 10 characters required)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-appealable"
                checked={isAppealable}
                onChange={(e) => setIsAppealable(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="is-appealable" className="cursor-pointer">
                Student can appeal this decision
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setIsAppealable(false);
              }}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending || rejectionReason.length < 10}
              variant="destructive"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Offer Letter Dialog */}
      <Dialog open={showOfferLetterDialog} onOpenChange={setShowOfferLetterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              <DialogTitle>Generate & Send Offer Letter</DialogTitle>
            </div>
            <DialogDescription>
              The application has been approved. Fill in the offer details to generate and send the offer letter to both the agent and student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Course Start Date */}
            <div className="space-y-2">
              <Label htmlFor="course-start-date">
                Course Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="course-start-date"
                type="date"
                value={courseStartDate}
                onChange={(e) => setCourseStartDate(e.target.value)}
                required
              />
            </div>

            {/* Tuition Fee */}
            <div className="space-y-2">
              <Label htmlFor="tuition-fee">
                Tuition Fee (AUD)
              </Label>
              <Input
                id="tuition-fee"
                type="number"
                min="0"
                step="0.01"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Leave as 0 to use the course default fee
              </p>
            </div>

            {/* Material Fee */}
            <div className="space-y-2">
              <Label htmlFor="material-fee">
                Material Fee (AUD)
              </Label>
              <Input
                id="material-fee"
                type="number"
                min="0"
                step="0.01"
                value={materialFee}
                onChange={(e) => setMaterialFee(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <Separator />

            {/* Offer Conditions */}
            <div className="space-y-2">
              <Label>Offer Conditions</Label>
              <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                {offerConditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Send className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm text-blue-900">What happens next?</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• The offer letter will be generated as a PDF</li>
                    <li>• It will be sent to the agent for review</li>
                    <li>• The student will receive a copy to review and sign</li>
                    <li>• Application status will change to "Offer Sent"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOfferLetterDialog(false);
                setCourseStartDate("");
                setTuitionFee(0);
                setMaterialFee(0);
              }}
              disabled={generateOfferLetterMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateOfferLetter}
              disabled={generateOfferLetterMutation.isPending || !courseStartDate}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Send className="h-4 w-4" />
              {generateOfferLetterMutation.isPending ? "Generating..." : "Generate & Send Offer Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
