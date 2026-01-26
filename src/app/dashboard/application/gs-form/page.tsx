/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GSScreeningForm } from "@/app/dashboard/application/gs-form/_components/gs-screening-form";
import { useState } from "react";

type View = "student" | "agent";

const Page = () => {
  const [view, setView] = useState<View>("student");

  return (
    <div className="max-w-6xl p-8 mx-auto space-y-6">
      <h3>This is temp page</h3>

      <GSScreeningForm currentView={view} />

      <div className="flex items-center gap-3">
        <label htmlFor="view" className="text-sm text-muted-foreground">
          (demo) View as:
        </label>

        <select
          id="view"
          value={view}
          onChange={(e: any) => setView(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-background"
        >
          <option value="student">Student</option>
          <option value="agent">Agent</option>
        </select>
      </div>
    </div>
  );
};

export default Page;
