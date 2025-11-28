"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DocumentType = {
  id: string;
  title: string;
  required: boolean;
  files: File[];
};

const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean(),
  files: z.array(z.instanceof(File)),
});

const documentsSchema = z.object({
  documents: z.array(documentSchema),
});

type DocumentsFormValues = z.infer<typeof documentsSchema>;

const defaultDocuments: DocumentType[] = [
  { id: "passport", title: "Applicant's Passport", required: true, files: [] },
  {
    id: "english-test",
    title: "Evidence Of English Test",
    required: true,
    files: [],
  },
  { id: "academic", title: "Academic Document", required: true, files: [] },
  {
    id: "work-experience",
    title: "Work Experience / Gap Evidence",
    required: false,
    files: [],
  },
  {
    id: "application-form",
    title: "Application Form Completed and Signed",
    required: true,
    files: [],
  },
  {
    id: "other-supporting",
    title: "Other Supporting Document",
    required: false,
    files: [],
  },
  {
    id: "applicants-academic",
    title: "Applicants Academic",
    required: false,
    files: [],
  },
];

export default function DocumentsForm() {
  const { handleSubmit, setValue } = useForm<DocumentsFormValues>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      documents: defaultDocuments,
    },
  });

  const [documents, setDocuments] = useState<DocumentType[]>(defaultDocuments);

  const syncDocuments = (updatedDocs: DocumentType[]) => {
    setDocuments(updatedDocs);
    setValue("documents", updatedDocs, { shouldValidate: true });
  };

  const handleFileUpload = (docId: string, files: FileList | null) => {
    if (!files) return;

    syncDocuments(
      documents.map((doc) =>
        doc.id === docId
          ? { ...doc, files: [...doc.files, ...Array.from(files)] }
          : doc
      )
    );
  };

  const handleFileRemove = (docId: string, fileIndex: number) => {
    syncDocuments(
      documents.map((doc) =>
        doc.id === docId
          ? { ...doc, files: doc.files.filter((_, i) => i !== fileIndex) }
          : doc
      )
    );
  };

  const onSubmit = (values: DocumentsFormValues) => {
    console.log("Documents form submitted", values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={doc.required ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {doc.required ? "Compulsory" : "Optional"}
                    </Badge>
                    <Badge
                      variant={doc.files.length > 0 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {doc.files.length > 0
                        ? `${doc.files.length} Uploaded`
                        : "Not Uploaded"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors",
                  doc.required && doc.files.length === 0
                    ? "border-destructive/40"
                    : ""
                )}
              >
                <input
                  type="file"
                  id={`file-${doc.id}`}
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileUpload(doc.id, e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor={`file-${doc.id}`} className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop files here to upload or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX
                  </p>
                </label>
              </div>

              {doc.files.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files:</Label>
                  {doc.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileRemove(doc.id, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit">Submit Documents</Button>
      </div>
    </form>
  );
}
