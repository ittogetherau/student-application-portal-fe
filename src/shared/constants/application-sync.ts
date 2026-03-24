import type { ApplicationSyncMetadata } from "@/service/application.service";

export const APPLICATION_SYNC_COMPLETION_IGNORED_KEYS: (keyof ApplicationSyncMetadata)[] =
  [
    "additional_services",
    "survey_responses",
    "declaration",
    "enrollment_data",
    "employment_history",
    "health_cover_policy",
    "schooling_history",
    "usi",
  ];

export const APPLICATION_SYNC_COMPLETION_ALLOW_NULL_KEYS: (keyof ApplicationSyncMetadata)[] =
  ["qualifications"];
