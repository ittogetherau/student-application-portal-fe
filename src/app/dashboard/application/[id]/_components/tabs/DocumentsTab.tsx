"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Eye, FileText, Loader2 } from "lucide-react";

//
export interface Document {
  id: string;
  document_type_name: string;
  file_size_bytes: number;
  status: "approved" | "rejected" | "pending";
  view_url?: string;
  download_url?: string;
}

//
const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
};

//

interface DocumentsTabProps {
  documents: Document[];
  isLoading: boolean;
}

const DocumentsTab = ({ documents, isLoading }: DocumentsTabProps) => (
  <Card>
    <CardHeader className="py-3 px-4">
      <CardTitle className="text-base">Application Documents</CardTitle>
      <CardDescription className="text-xs">
        All documents submitted with this application
      </CardDescription>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No documents found for this application
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default DocumentsTab;

interface DocumentCardProps {
  doc: Document;
}

const DocumentCard = ({ doc }: DocumentCardProps) => (
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
          <span>•</span>
          <Badge
            variant={
              doc.status === "approved"
                ? "default"
                : doc.status === "rejected"
                ? "destructive"
                : "secondary"
            }
            className="h-4 text-[9px] px-1 font-medium uppercase"
          >
            {doc.status}
          </Badge>
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
