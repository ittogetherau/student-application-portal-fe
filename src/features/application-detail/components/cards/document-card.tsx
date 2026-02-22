import { Button } from "@/components/ui/button";
import type { ApplicationDocumentListItem } from "@/service/document.service";
import { Download, Eye, FileText } from "lucide-react";
import { formatBytes } from "../../utils/format-bytes";

interface Props {
  doc: ApplicationDocumentListItem;
}

export const DocumentCard = ({ doc }: Props) => (
  <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-background rounded-md border text-muted-foreground">
        <FileText className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium truncate max-w-[150px] lg:max-w-xs">
          {doc.document_type_name}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{formatBytes(doc.file_size_bytes)}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {doc.view_url && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          asChild
          title="View"
        >
          <a href={doc.view_url} target="_blank" rel="noopener noreferrer">
            <Eye className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
      {doc.download_url && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary"
          asChild
          title="Download"
        >
          <a href={doc.download_url} download>
            <Download className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  </div>
);
