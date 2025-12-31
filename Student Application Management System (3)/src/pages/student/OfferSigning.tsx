import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Download, Check, X } from 'lucide-react';

export default function StudentOfferSigning() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl">Offer Letter</h1>
        <p className="text-muted-foreground">
          Review and sign your conditional offer letter
        </p>
      </div>

      {/* Offer letter preview */}
      <Card>
        <CardHeader>
          <CardTitle>Conditional Offer Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 rounded-lg p-12 bg-muted/30 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">PDF Offer Letter Preview</p>
            <Button variant="outline" className="mt-4 gap-2">
              <Download className="h-4 w-4" />
              Download Offer Letter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signature section */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Sign here to accept this offer
            </p>
            <div className="h-32 border rounded bg-background mb-4">
              {/* Signature canvas would go here */}
            </div>
            <Button variant="outline">Clear Signature</Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button className="flex-1 gap-2" size="lg">
          <Check className="h-5 w-5" />
          Accept Offer
        </Button>
        <Button variant="destructive" className="gap-2" size="lg">
          <X className="h-5 w-5" />
          Decline Offer
        </Button>
      </div>
    </div>
  );
}
