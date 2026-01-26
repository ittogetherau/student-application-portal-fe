"use client";

import { Clock, ExternalLink, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GSInterviewTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium">Awaiting completion</p>
            <p className="text-xs text-muted-foreground">
              Interview scheduled for Feb 10, 2026.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Recording</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
            <Video className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Recording placeholder</p>
              <p className="text-xs text-muted-foreground">
                Upload or link the interview recording here.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <ExternalLink className="h-4 w-4" />
              Open Recording
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
