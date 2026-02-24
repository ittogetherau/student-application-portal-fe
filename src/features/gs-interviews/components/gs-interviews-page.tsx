"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import type {
  DatesSetArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { useGsInterviewsQuery } from "../hooks/gs-interviews.hook";
import {
  addDaysLocal,
  formatLocalYYYYMMDD,
  resolveInitialMonthRange,
} from "../utils/date";
import {
  getInterviewEnd,
  getInterviewJoinUrl,
  getInterviewStart,
  getInterviewTitle,
} from "../utils/interview";

export default function GsInterviewsPage() {
  const [range, setRange] = useState(resolveInitialMonthRange);

  const interviewsQuery = useGsInterviewsQuery({
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  });

  useEffect(() => {
    if (!interviewsQuery.isError) return;
    const message =
      interviewsQuery.error instanceof Error
        ? interviewsQuery.error.message
        : "Failed to load interviews";
    toast.error(message);
  }, [interviewsQuery.error, interviewsQuery.isError]);

  const events: EventInput[] = useMemo(() => {
    const items = interviewsQuery.data ?? [];

    return items
      .map((item): EventInput | null => {
        const start = getInterviewStart(item);
        if (!start) return null;

        const end = getInterviewEnd(item) || undefined;
        const joinUrl = getInterviewJoinUrl(item) || undefined;

        return {
          id: item.id,
          title: getInterviewTitle(item),
          start,
          end,
          extendedProps: {
            joinUrl,
            applicationId: item.application_id,
          },
        };
      })
      .filter(Boolean) as EventInput[];
  }, [interviewsQuery.data]);

  const handleDatesSet = (arg: DatesSetArg) => {
    const dateFrom = formatLocalYYYYMMDD(arg.start);
    const dateTo = formatLocalYYYYMMDD(addDaysLocal(arg.end, -1));

    setRange((prev) =>
      prev.dateFrom === dateFrom && prev.dateTo === dateTo
        ? prev
        : { dateFrom, dateTo },
    );
  };

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.preventDefault();

    const joinUrl =
      (arg.event.extendedProps?.joinUrl as string | undefined) || "";
    if (!joinUrl) {
      toast.error("No join URL available for this interview.");
      return;
    }

    window.open(joinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <ContainerLayout className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">GS Interviews</h1>
          <p className="text-sm text-muted-foreground">
            {range.dateFrom} to {range.dateTo}
            {interviewsQuery.isFetching ? " \u2022 Loading..." : ""}
          </p>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          start: "title",
          center: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          end: "today prev,next",
        }}
        datesSet={handleDatesSet}
        events={events}
        selectable={false}
        editable={false}
        eventClick={handleEventClick}
        select={undefined}
        eventContent={undefined}
        nowIndicator
        weekNumbers
        navLinks
        height="auto"
        expandRows
      />
    </ContainerLayout>
  );
}
