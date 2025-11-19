'use client';

import { useEffect, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentsFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

interface DocumentType {
  id: string;
  title: string;
  required: boolean;
  files: File[];
}

export default function DocumentsForm({ data, onUpdate, onComplete }: DocumentsFormProps) {
  const [documents, setDocuments] = useState<DocumentType[]>(data.documents || [
    { id: 'passport', title: "Applicant's Passport", required: true, files: [] },
    { id: 'english-test', title: 'Evidence Of English Test', required: true, files: [] },
    { id: 'academic', title: 'Academic Document', required: true, files: [] },
    { id: 'work-experience', title: 'Work Experience / Gap Evidence', required: false, files: [] },
    { id: 'application-form', title: 'Application Form Completed and Signed', required: true, files: [] },
    { id: 'other-supporting', title: 'Other Supporting Document', required: false, files: [] },
    { id: 'applicants-academic', title: "Applicants Academic", required: false, files: [] },
  ]);

  useEffect(() => {
    onUpdate({ documents });
  }, [documents, onUpdate]);

  useEffect(() => {
    const requiredDocs = documents.filter(d => d.required);
    const allRequiredUploaded = requiredDocs.every(d => d.files.length > 0);
    if (allRequiredUploaded) {
      onComplete();
    }
  }, [documents, onComplete]);

  const handleFileUpload = (docId: string, files: FileList | null) => {
    if (!files) return;
    
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, files: [...doc.files, ...Array.from(files)] }
          : doc
      )
    );
  };

  const handleFileRemove = (docId: string, fileIndex: number) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, files: doc.files.filter((_, i) => i !== fileIndex) }
          : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={doc.required ? 'destructive' : 'secondary'} className="text-xs">
                      {doc.required ? 'Compulsory' : 'Optional'}
                    </Badge>
                    <Badge variant={doc.files.length > 0 ? 'default' : 'outline'} className="text-xs">
                      {doc.files.length > 0 ? `${doc.files.length} Uploaded` : 'Not Uploaded'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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

              {/* Uploaded Files List */}
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
    </div>
  );
}

