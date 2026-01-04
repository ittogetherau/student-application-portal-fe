"use client";

import applicationService, {
  TimelineResponse,
} from "@/service/application.service";
import { Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface props {
  id: string;
}

const TimelineTab = ({ id }: props) => {
  const [data, setData] = useState<TimelineResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await applicationService.getApplicationTimeline(id);

        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load timeline");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((el, index) => (
        <div className="flex gap-2" key={el.id}>
          <div className="flex flex-col items-center">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            {index < data.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
            )}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-sm font-medium leading-tight">{el.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatDate(el.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineTab;
