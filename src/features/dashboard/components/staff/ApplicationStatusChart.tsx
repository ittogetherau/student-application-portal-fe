"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Filter, X } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { normalizeDashboardStatusItems } from "../../utils/application-status";

export interface ApplicationStatusItem {
  name: string;
  value: number;
  color: string;
}

interface ApplicationStatusChartProps {
  data: ApplicationStatusItem[];
}

export function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  const [
    { start_date: startDateParam, end_date: endDateParam },
    setDateParams,
  ] = useQueryStates({
    start_date: parseAsString.withOptions({
      history: "replace",
      scroll: false,
    }),
    end_date: parseAsString.withOptions({ history: "replace", scroll: false }),
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const appliedStartDate = startDateParam ?? "";
  const appliedEndDate = endDateParam ?? "";

  const [startDateDraft, setStartDateDraft] = useState(appliedStartDate);
  const [endDateDraft, setEndDateDraft] = useState(appliedEndDate);

  const hasActiveDateFilter = Boolean(appliedStartDate || appliedEndDate);
  const hasDraftChanges =
    startDateDraft !== appliedStartDate || endDateDraft !== appliedEndDate;
  const hasInvalidRange =
    Boolean(startDateDraft) &&
    Boolean(endDateDraft) &&
    startDateDraft > endDateDraft;

  const applyDateFilter = () => {
    void setDateParams({
      start_date: startDateDraft || null,
      end_date: endDateDraft || null,
    });
    setIsFilterOpen(false);
  };

  const clearDateFilter = () => {
    setStartDateDraft("");
    setEndDateDraft("");

    void setDateParams({
      start_date: null,
      end_date: null,
    });
    setIsFilterOpen(false);
  };

  const handleFilterPopoverChange = (open: boolean) => {
    setIsFilterOpen(open);
    if (open) {
      setStartDateDraft(appliedStartDate);
      setEndDateDraft(appliedEndDate);
    }
  };

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const chartData = useMemo(() => normalizeDashboardStatusItems(data), [data]);

  return (
    <div className="bg-card rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
            Application Distribution
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Status breakdown for current intake
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={handleFilterPopoverChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Date Filter
                {hasActiveDateFilter ? (
                  <span className="rounded-sm bg-primary/10 px-1 text-[10px] font-semibold text-primary">
                    Active
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-distribution-start-date">
                    Start date
                  </Label>
                  <Input
                    id="app-distribution-start-date"
                    type="date"
                    value={startDateDraft}
                    onChange={(event) => setStartDateDraft(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-distribution-end-date">End date</Label>
                  <Input
                    id="app-distribution-end-date"
                    type="date"
                    value={endDateDraft}
                    onChange={(event) => setEndDateDraft(event.target.value)}
                  />
                </div>

                {hasInvalidRange ? (
                  <p className="text-xs text-destructive">
                    Start date must be on or before end date.
                  </p>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDateFilter}
                    disabled={
                      !hasActiveDateFilter && !startDateDraft && !endDateDraft
                    }
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyDateFilter}
                    disabled={hasInvalidRange || !hasDraftChanges}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {hasActiveDateFilter ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearDateFilter}
              aria-label="Clear date filter"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="h-[300px] w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="value" name="Applications" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
