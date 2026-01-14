import { useEffect, useRef } from "react";
import applicationStepsService from "@/service/application-steps.service";
import type {
  AdditionalServicesValues,
  EmploymentHistoryValues,
  HealthCoverValues,
  SchoolingHistoryValues,
  SurveyValues,
} from "@/validation/application.validation";

const DEFAULT_HEALTH_COVER: HealthCoverValues = {
  arrange_OSHC: false,
  OSHC_provider: "",
  OSHC_start_date: "",
  OSHC_end_date: "",
  OSHC_duration: "",
  OSHC_fee: 0,
};

const HEALTH_COVER_PAYLOAD = {
  ...DEFAULT_HEALTH_COVER,
  has_oshc: "false",
} as HealthCoverValues & { has_oshc: string };

const DEFAULT_SCHOOLING: SchoolingHistoryValues = {
  highest_school_level: "@@ - Not Specified",
  still_attending: "No",
  secondary_school_type: "",
  entries: [],
};

const DEFAULT_EMPLOYMENT: EmploymentHistoryValues = {
  employment_status: "09 - Not Specified",
  entries: [],
};

const DEFAULT_ADDITIONAL_SERVICES: AdditionalServicesValues = {
  request_additional_services: "No",
  services: [],
};

const DEFAULT_SURVEY: SurveyValues = {
  availability_status: "M",
};

const HealthCoverAutoSubmit = ({
  applicationId,
}: {
  applicationId?: string;
}) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!applicationId || hasTriggered.current) return;

    hasTriggered.current = true;
    Promise.all([
      applicationStepsService.updateHealthCover(
        applicationId,
        HEALTH_COVER_PAYLOAD
      ),
      applicationStepsService.updateSchoolingHistory(
        applicationId,
        DEFAULT_SCHOOLING
      ),
      applicationStepsService.updateEmploymentHistory(
        applicationId,
        DEFAULT_EMPLOYMENT
      ),
      applicationStepsService.updateAdditionalServices(
        applicationId,
        DEFAULT_ADDITIONAL_SERVICES
      ),
      applicationStepsService.updateSurvey(applicationId, DEFAULT_SURVEY),
    ]).catch((error) => {
      console.error("[HealthCoverAutoSubmit] seed failed", error);
    });
  }, [applicationId]);

  return null;
};

export default HealthCoverAutoSubmit;
