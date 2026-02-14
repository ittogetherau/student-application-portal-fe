"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Hash,
  Mail,
  MapPin,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ApplicationInfoRow from "./application-info-row";

export type ApplicationHeaderDetailsData = {
  studentName: string;
  trackingCode?: string | null;
  studentEmail?: string | null;
  courseLabel: string;
  campusLabel: string;
  submittedLabel: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string | null;
};

type ApplicationHeaderDetailsProps = {
  data: ApplicationHeaderDetailsData;
  isStaffOrAdmin: boolean;
  onBack: () => void;
};

export default function ApplicationHeaderDetails({
  data,
  isStaffOrAdmin,
  onBack,
}: ApplicationHeaderDetailsProps) {
  return (
    <div className="flex items-start gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-8 w-8 shrink-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 items-end">
        <div className="space-y-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium truncate">
            {data.studentName}
          </h1>

          <ApplicationInfoRow
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="Ref ID"
            value={data.trackingCode}
          />

          <ApplicationInfoRow
            icon={<Mail className="h-3.5 w-3.5" />}
            label="Email"
            value={data.studentEmail}
          />
        </div>

        <div className="space-y-2 min-w-0">
          <ApplicationInfoRow
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="Course"
            value={data.courseLabel}
          />

          <ApplicationInfoRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Campus"
            value={data.campusLabel}
          />

          <ApplicationInfoRow
            icon={<CalendarCheck className="h-3.5 w-3.5" />}
            label="Submitted"
            value={data.submittedLabel}
          />
        </div>

        {isStaffOrAdmin ? (
          <div className="space-y-2 min-w-0">
            <ApplicationInfoRow
              icon={<User className="h-3.5 w-3.5" />}
              label="Agent"
              value={data.agentName}
            />

            <ApplicationInfoRow
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email"
              value={data.agentEmail}
            />
            {data.agentPhone ? (
              <ApplicationInfoRow
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Phone"
                value={data.agentPhone}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
