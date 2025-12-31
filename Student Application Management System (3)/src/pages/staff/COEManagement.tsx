import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Upload, Download, Send } from 'lucide-react';
import { ApplicationStatusBadge } from '../../components/shared/ApplicationStatusBadge';
import { mockApplications } from '../../lib/mockData';

export default function StaffCOEManagement() {
  const coeReadyApplications = mockApplications.filter(
    app => app.status === 'gs_approved' || app.status === 'coe_issued'
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">COE Management</h1>
        <p className="text-muted-foreground">
          Upload and manage Confirmation of Enrollment documents
        </p>
      </div>

      {/* Pending COE uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Pending COE Uploads</CardTitle>
          <CardDescription>Applications ready for COE</CardDescription>
        </CardHeader>
        <CardContent>
          {coeReadyApplications.length > 0 ? (
            <div className="space-y-3">
              {coeReadyApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{app.studentName}</p>
                      <Badge variant="outline">{app.referenceNumber}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.course} • {app.destination}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {formatDate(app.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApplicationStatusBadge status={app.status} />
                    {app.status === 'gs_approved' ? (
                      <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload COE
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2">
                        <Send className="h-4 w-4" />
                        Send to Agent
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No applications pending COE upload
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issued COEs */}
      <Card>
        <CardHeader>
          <CardTitle>Issued COEs</CardTitle>
          <CardDescription>Recently issued COE documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockApplications
              .filter(app => app.status === 'coe_issued')
              .map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{app.studentName}</p>
                      <Badge variant="outline">{app.referenceNumber}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.course}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">COE Issued</Badge>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
