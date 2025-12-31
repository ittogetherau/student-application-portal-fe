import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowRight, Users, Briefcase } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-lg bg-primary items-center justify-center mb-4">
            <span className="text-3xl text-primary-foreground">C</span>
          </div>
          <h1 className="text-2xl">Churchill University</h1>
          <p className="text-muted-foreground">Application Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Use the floating button on the bottom-right to select a user and sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Staff Portal</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access for university staff to review applications, manage interviews, and issue COEs
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="text-xs bg-background px-2 py-1 rounded border">7 Staff Members</div>
                  <div className="text-xs bg-background px-2 py-1 rounded border">3 Admin Roles</div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Agent Portal</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access for education agents to submit and track student applications
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="text-xs bg-background px-2 py-1 rounded border">5 Agents</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">How to Sign In:</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Click the floating button in the bottom-right corner to see all available users and select one to sign in.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student tracking link */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm">Track your application as a student?</p>
              <Button
                variant="link"
                onClick={() => navigate('/track')}
                className="text-primary"
              >
                Go to Application Tracking →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          &copy; 2024 Churchill University. All rights reserved.
        </p>
      </div>
    </div>
  );
}