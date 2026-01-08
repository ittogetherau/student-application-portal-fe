"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApplicationRequestSignaturesMutation } from "@/hooks/useApplication.hook";
import type { SignatureRequestResponse } from "@/service/signature.service";

interface ApplicationSignDisplayProps {
  applicationId: string;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApplicationSignDisplay = ({
  applicationId,
}: ApplicationSignDisplayProps) => {
  const { data, mutateAsync, error, isPending } =
    useApplicationRequestSignaturesMutation(applicationId);

  const handleRequest = async () => {
    try {
      await mutateAsync();
    } catch (error) {}
  };

  if (error)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signature Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            An error occurred while fetching the data, please try again later.
          </CardDescription>
          <Button
            size="sm"
            variant={"link"}
            onClick={handleRequest}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Request Signatures"}
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Signature Requests</CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {data?.items?.length ? (
          <div className="space-y-3">
            {data.items.map((item, i) => {
              if (i === data.items.length - 1)
                return (
                  <div key={item.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {item.document_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: {item.status}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDateTime(item.created_at)}
                      </p>
                    </div>

                    <div className="grid gap-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Student</span>
                        <div className="text-right">
                          <p>{item.student.name}</p>
                          <p>{item.student.email}</p>
                          <a
                            href={item.student.signing_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2"
                          >
                            Open signing link
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Agent</span>
                        <div className="text-right">
                          <p>{item.agent.name}</p>
                          <p>{item.agent.email}</p>
                          <a
                            href={item.agent.signing_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2"
                          >
                            Open signing link
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <Button
            size="sm"
            variant={"link"}
            onClick={handleRequest}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Request Signatures"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationSignDisplay;
