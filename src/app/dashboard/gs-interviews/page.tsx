"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

import React from "react";

const Page = () => {
  return (
    <div className="p-4 bg-background min-h-screen">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          start: "title",
          center: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          end: "today prev,next",
        }}
        events={[]}
        selectable={false}
        editable={false}
        eventClick={undefined}
        select={undefined}
        eventContent={undefined}
        nowIndicator
        weekNumbers
        navLinks
        height="auto"
        expandRows
      />
    </div>
  );
};

export default Page;
