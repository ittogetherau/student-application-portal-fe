"use client";

import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import TasksDetailsSidebar from "./tasks-details-sidebar";
import TasksListSidebar from "./tasks-list-sidebar";
import TasksThreadPanel from "./tasks-thread-panel";
import { cn } from "@/shared/lib/utils";

const readLocalStorageBool = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (stored === null) return fallback;
  return stored === "true";
};

export default function TasksPage() {
  const [selectedThreadId, setSelectedThreadId] = useQueryState("threadId");
  const [selectedApplicationId, setSelectedApplicationId] =
    useQueryState("applicationId");
  const [detailShown, setDetailShown] = useState(() =>
    readLocalStorageBool("tasks.detailShown", false),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("tasks.detailShown", String(detailShown));
  }, [detailShown]);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="grid grid-cols-9 h-full">
        <TasksListSidebar
          selectedThreadId={selectedThreadId}
          selectedApplicationId={selectedApplicationId}
          setSelectedThreadId={setSelectedThreadId}
          setSelectedApplicationId={setSelectedApplicationId}
        />

        <section
          className={cn(
            "flex flex-col overflow-hidden",
            detailShown ? "col-span-5 " : "col-span-7",
          )}
        >
          <TasksThreadPanel
            selectedThreadId={selectedThreadId}
            selectedApplicationId={selectedApplicationId}
            setDetailShown={setDetailShown}
          />
        </section>

        {detailShown && (
          <aside className="col-span-2 border-l bg-muted/20 overflow-y-auto">
            <TasksDetailsSidebar
              selectedThreadId={selectedThreadId}
              selectedApplicationId={selectedApplicationId}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
