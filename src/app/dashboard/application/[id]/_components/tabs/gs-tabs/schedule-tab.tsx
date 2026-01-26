"use client";

import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GSScheduleTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Interview Scheduling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Meeting window</p>
              <p className="text-xs text-muted-foreground">
                Schedule a video interview with the student.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium">Meeting title</label>
            <Input
              value="GS Assessment Interview"
              readOnly
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Date and time</label>
            <Input value="2026-02-10 10:30" readOnly className="text-sm" />
          </div>
        </div>
        <Button className="gap-2" disabled>
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>
      </CardContent>
    </Card>
  );
}
