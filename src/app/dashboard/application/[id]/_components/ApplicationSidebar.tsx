"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUtcToFriendlyLocal } from "@/lib/format-utc-to-local";
import { ApplicationDetailResponse } from "@/service/application.service";
import {
  Calendar,
  Clock,
  GraduationCap,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  User2,
} from "lucide-react";
import React from "react";

//

interface ApplicationSidebarProps {
  application: ApplicationDetailResponse;
}

const ApplicationSidebar = ({ application }: ApplicationSidebarProps) => {
  const overviewItems: InfoItemProps[] = [
    {
      icon: Mail,
      label: "Student Email",
      value: application.personal_details?.email || "N/A",
    },
    {
      icon: Phone,
      label: "Phone",
      value: application.personal_details?.phone || "N/A",
    },
    {
      icon: GraduationCap,
      label: "Course",
      value: application.course_offering_id || "N/A",
      title: application.course_offering_id || undefined,
    },

    {
      icon: MapPin,
      label: "Destination",
      value: application.personal_details?.country || "Australia",
    },
    { icon: Calendar, label: "Intake", value: "February 2025" },
    {
      icon: Clock,
      label: "Submitted",
      value: application.submitted_at
        ? formatUtcToFriendlyLocal(application.submitted_at)
        : "N/A",
    },
    {
      icon: Clock,
      label: "Last Updated",
      value: application.updated_at
        ? formatUtcToFriendlyLocal(application.updated_at)
        : "N/A",
    },
  ];

  return (
    <div className="lg:col-span-1 sticky top-4 space-y-4 h-fit">
      <Card className="shadow-sm border-muted/60 p-2">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-lg">Application Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2 pb-4">
          <div className="grid gap-y-4">
            {overviewItems.map((item, idx) => (
              <InfoItem key={idx} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSidebar;

//

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  title?: string;
  children?: React.ReactNode;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  title,
  children,
}: InfoItemProps) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <div>
      <p className="text-xs text-muted-foreground tracking-wider">{label}</p>
      {children ? (
        children
      ) : (
        <p className="text-sm break-all" title={title}>
          {value}
        </p>
      )}
    </div>
  </div>
);
