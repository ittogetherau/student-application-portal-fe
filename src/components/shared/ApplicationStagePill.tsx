import type { DataTableFacetedFilterOption } from "@/components/data-table/data-table";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import { cn } from "@/shared/lib/utils";
import {
  STAGE_PILL_CONFIG,
  formatStageLabel,
  getRoleStageLabel,
  normalizeStage,
} from "@/shared/config/application-stage.config";

export const applicationStageFilterOptions: DataTableFacetedFilterOption[] =
  Object.entries(STAGE_PILL_CONFIG).map(([stage, config]) => ({
    value: stage,
    label: config.label,
  }));

interface ApplicationStagePillProps {
  stage?: APPLICATION_STAGE | string | null;
  className?: string;
  role?: USER_ROLE | string;
}

export function ApplicationStagePill({
  stage,
  className,
  role,
}: ApplicationStagePillProps) {
  const roleKey = role ? String(role).toLowerCase() : "";
  const roleVariant =
    roleKey === USER_ROLE.STAFF
      ? "staff"
      : roleKey === USER_ROLE.AGENT
        ? "agent"
        : null;
  const normalizedStage = normalizeStage(stage);
  const roleLabel =
    normalizedStage && roleVariant
      ? getRoleStageLabel(normalizedStage, role)
      : undefined;
  const config = normalizedStage ? STAGE_PILL_CONFIG[normalizedStage] : null;
  const formattedStage =
    stage && String(stage) ? formatStageLabel(String(stage)) : undefined;
  const isLegacyStage = !normalizedStage && !!formattedStage;
  const label =
    roleLabel ?? config?.label ?? (isLegacyStage ? `${formattedStage}` : "N/A");
  const legacyClassName =
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config?.className ?? (isLegacyStage ? legacyClassName : undefined),
        className,
      )}
    >
      {label}
    </span>
  );
}
