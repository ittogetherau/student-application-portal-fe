  "use client";

  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { CloudCog, FileText, Loader2 } from "lucide-react";

  export const LoadingState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  interface ErrorStateProps {
    error: Error | null;
    onBack: () => void;
  }

  export const ErrorState = ({ error, onBack }: ErrorStateProps) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <CloudCog className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-medium">Error Loading Application</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        {error?.message ||
          "Something went wrong while fetching the application details."}
      </p>
      <Button onClick={onBack} className="mt-6">
        Back to Applications
      </Button>
    </div>
  );

  interface NotFoundStateProps {
    onBack: () => void;
  }

  export const NotFoundState = ({ onBack }: NotFoundStateProps) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <div className="rounded-full bg-muted p-3 mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">Application Not Found</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        The application you are looking for does not exist or you do not have
        permission to view it.
      </p>
      <Button onClick={onBack} className="mt-6">
        Back to Applications
      </Button>
    </div>
  );

  //

  interface EmptyTabProps {
    title: string;
    message: string;
  }

  export const EmptyTab = ({ title, message }: EmptyTabProps) => (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-center py-6 text-xs text-muted-foreground">
          {message}
        </div>
      </CardContent>
    </Card>
  );
