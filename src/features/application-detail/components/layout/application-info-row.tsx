import { ReactNode } from "react";

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value?: string | null;
};

export default function ApplicationInfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs min-w-0">
      <div className="flex items-center gap-2 text-muted-foreground w-24 shrink-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="font-medium truncate">{value || "N/A"}</span>
    </div>
  );
}
