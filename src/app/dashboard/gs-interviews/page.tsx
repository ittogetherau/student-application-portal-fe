"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

const Page = () => {
  return (
    <ContainerLayout className="p-4 ">
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
    </ContainerLayout>
  );
};

export default Page;
