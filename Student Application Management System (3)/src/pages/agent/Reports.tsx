import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Download, Calendar } from 'lucide-react';

export default function AgentReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate and download application reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Export your application data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">All Applications Report</p>
              <p className="text-sm text-muted-foreground">Export all application data</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Monthly Summary</p>
              <p className="text-sm text-muted-foreground">Current month statistics</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Custom Date Range</p>
              <p className="text-sm text-muted-foreground">Select custom date range</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
