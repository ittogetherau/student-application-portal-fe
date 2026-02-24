"use client";

import { useQueryState } from "nuqs";

import TasksDetailsSidebar from "./tasks-details-sidebar";
import TasksListSidebar from "./tasks-list-sidebar";
import TasksThreadPanel from "./tasks-thread-panel";

export default function TasksPage() {
  const [selectedThreadId, setSelectedThreadId] = useQueryState("threadId");
  const [selectedApplicationId, setSelectedApplicationId] =
    useQueryState("applicationId");

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="grid grid-cols-9 h-full">
        <TasksListSidebar
          selectedThreadId={selectedThreadId}
          selectedApplicationId={selectedApplicationId}
          setSelectedThreadId={setSelectedThreadId}
          setSelectedApplicationId={setSelectedApplicationId}
        />

        <TasksThreadPanel
          selectedThreadId={selectedThreadId}
          selectedApplicationId={selectedApplicationId}
        />

        <TasksDetailsSidebar
          selectedThreadId={selectedThreadId}
          selectedApplicationId={selectedApplicationId}
        />
      </div>
    </div>
  );
}
