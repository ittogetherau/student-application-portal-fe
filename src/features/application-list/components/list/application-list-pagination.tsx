import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type ApplicationListPaginationProps = {
  page: number;
  maxPage: number;
  isLoading: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function ApplicationListPagination({
  page,
  maxPage,
  isLoading,
  isFetching,
  onPrev,
  onNext,
}: ApplicationListPaginationProps) {
  const disableNext = isLoading || isFetching || page >= maxPage;

  return (
    <div className="flex items-center gap-4 justify-between">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span className="font-medium">{`Page ${page} of ${maxPage || 1}`}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={isLoading || isFetching || page <= 1}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={disableNext}>
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
