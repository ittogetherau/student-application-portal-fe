"use client";

import { useApplicationTimelineQuery } from "@/shared/hooks/use-applications";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { Clock, Loader2 } from "lucide-react";

interface props {
  id: string;
}

const formatTimelineMessage = (rawMessage: string) => {
  let message = rawMessage;
  if (message.includes("enrollment_data changed:")) {
    message = message.replace(
      "enrollment_data changed:",
      "Application details updated:",
    );
  }


  // ESOS Onshore patterns
  const esosAgentEligible = /esos_agent_assessment:\s*['"]?(?:none|not_eligible|eligible)?['"]?\s*->\s*['"]?eligible['"]?/i;
  const esosAgentNotEligible = /esos_agent_assessment:\s*['"]?(?:none|not_eligible|eligible)?['"]?\s*->\s*['"]?not_eligible['"]?/i;
  
  const esosAdmissionsEligible = /esos_admissions_review:\s*['"]?(?:none|further_review|not_eligible|eligible)?['"]?\s*->\s*['"]?eligible['"]?/i;
  const esosAdmissionsNotEligible = /esos_admissions_review:\s*['"]?(?:none|further_review|not_eligible|eligible)?['"]?\s*->\s*['"]?not_eligible['"]?/i;
  const esosAdmissionsFurther = /esos_admissions_review:\s*['"]?(?:none|further_review|not_eligible|eligible)?['"]?\s*->\s*['"]?further_review['"]?/i;

  const esosCoeEligible = /esos_coe_confirmation:\s*['"]?(?:none|confirmed_not_eligible|confirmed_eligible)?['"]?\s*->\s*['"]?confirmed_eligible['"]?/i;
  const esosCoeNotEligible = /esos_coe_confirmation:\s*['"]?(?:none|confirmed_not_eligible|confirmed_eligible)?['"]?\s*->\s*['"]?confirmed_not_eligible['"]?/i;

  const esosAgentDate = /esos_agent_assessment_date:\s*['"]?(?:none)?['"]?\s*->\s*['"]?[^'"]+['"]?/i;
  const esosAdmissionsDate = /esos_admissions_review_date:\s*['"]?(?:none)?['"]?\s*->\s*['"]?[^'"]+['"]?/i;
  const esosCoeDate = /esos_coe_confirmation_date:\s*['"]?(?:none)?['"]?\s*->\s*['"]?[^'"]+['"]?/i;


  // ESOS overrides
  if (esosAgentEligible.test(message)) {
    return message.includes("updated application:")
      ? message.replace(/Application details updated:.*$/i, "Updated ESOS Agent Self-Assessment to: Eligible")
      : "Agent self-assessed ESOS commission eligibility as: Eligible";
  }
  if (esosAgentNotEligible.test(message)) {
    return message.includes("updated application:")
      ? message.replace(/Application details updated:.*$/i, "Updated ESOS Agent Self-Assessment to: Not Eligible")
      : "Agent self-assessed ESOS commission eligibility as: Not Eligible";
  }

  if (esosAdmissionsEligible.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Assessed ESOS commission eligibility as: Eligible");
  }
  if (esosAdmissionsNotEligible.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Assessed ESOS commission eligibility as: Not Eligible");
  }
  if (esosAdmissionsFurther.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Marked ESOS commission assessment as: Requires Further Review");
  }

  if (esosCoeEligible.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Confirmed ESOS COE eligibility as: Confirmed Eligible");
  }
  if (esosCoeNotEligible.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Confirmed ESOS COE eligibility as: Confirmed Not Eligible");
  }

  if (esosCoeDate.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Finalized COE and generated ESOS Commission Compliance PDF");
  }
  if (esosAdmissionsDate.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Sent Offer Letter and saved ESOS Admissions review timestamp");
  }
  if (esosAgentDate.test(message)) {
    return message.replace(/Application details updated:.*$/i, "Agent submitted ESOS Commission self-assessment timestamp");
  }

  return message;
};

const TimelineTab = ({ id }: props) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useApplicationTimelineQuery(id);
  const data = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Failed to load timeline
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((el, index) => (
        <div className="flex gap-2" key={el.id}>
          <div className="flex flex-col items-center">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            {index < data.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
            )}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-sm font-medium leading-tight">{el.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatUtcToFriendlyLocal(el.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineTab;
