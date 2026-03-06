import { cn } from "@/shared/lib/utils";

type StepButtonProps = {
  title: string;
  index: number;
  selected?: boolean;
};

export function StepButton({ title, index, selected }: StepButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center lg:justify-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0 w-full",
        selected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          selected
            ? "bg-primary-foreground text-primary font-bold"
            : "bg-muted text-muted-foreground",
        )}
      >
        {index}
      </div>

      <span className="text-sm">{title}</span>
    </button>
  );
}
