"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationDocumentListItem } from "@/service/document.service";
import { useApplicationDocumentsQuery } from "@/shared/hooks/document.hook";
import { Loader2 } from "lucide-react";
import { AdditionalDocumentsUpload } from "../additional-documents-upload";
import { DocumentCard } from "../cards/document-card";

//
type Document = ApplicationDocumentListItem;

interface DocumentsTabProps {
  applicationId: string;
}

const DocumentsTab = ({ applicationId }: DocumentsTabProps) => {
  const { data: documentsResponse, isLoading } =
    useApplicationDocumentsQuery(applicationId);
  const documents = (documentsResponse?.data || []) as Document[];

  return (
    <>
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Application Documents</CardTitle>
              <CardDescription className="text-xs">
                All documents submitted with this application
              </CardDescription>
            </div>
          </div>
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

          <AdditionalDocumentsUpload applicationId={applicationId} />
        </CardContent>
      </Card>
    </>
  );
};

export default DocumentsTab;
