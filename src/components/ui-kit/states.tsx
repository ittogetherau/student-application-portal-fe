"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import ContainerLayout from "./layout/container-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Loader, AlertCircle, SearchX, Inbox } from "lucide-react";

type Action = {
  label: string;
  onClick: () => void;
};

interface BaseStateProps {
  title?: string;
  description?: string;
  action?: Action;
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

const BaseState = ({
  title,
  description,
  action,
  className,
  children,
  icon,
}: BaseStateProps) => {
  return (
    <ContainerLayout className={className}>
      <Card className="flex min-h-40 items-center justify-center">
        {children ? (
          children
        ) : (
          <CardContent className="flex w-full flex-col items-center gap-3 py-10 text-center">
            {icon && <div className="text-muted-foreground">{icon}</div>}

            {(title || description) && (
              <CardHeader className="p-0">
                {title && (
                  <CardTitle className="text-base font-semibold">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="max-w-sm text-sm">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>
            )}

            {action && (
              <CardFooter className="p-0 pt-2">
                <Button size="sm" onClick={action.onClick}>
                  {action.label}
                </Button>
              </CardFooter>
            )}
          </CardContent>
        )}
      </Card>
    </ContainerLayout>
  );
};

export const LoadingState = () => (
  <BaseState>
    <div className="grid h-32 w-full place-items-center">
      <Loader className="h-5 w-5 animate-spin text-accent" />
    </div>
  </BaseState>
);

export const ErrorState = ({
  title = "Something went wrong",
  description = "Please try again.",
  action,
  className,
}: BaseStateProps) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<AlertCircle className="h-10 w-10 text-destructive" />}
  />
);

export const NotFoundState = ({
  title = "Not found",
  description = "We couldn't find what you were looking for.",
  action,
  className,
}: BaseStateProps) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<SearchX className="h-10 w-10 text-muted-foreground" />}
  />
);

export const EmptyState = ({
  title = "No data yet",
  description = "There is nothing to display here.",
  action,
  className,
}: BaseStateProps) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<Inbox className="h-10 w-10 text-muted-foreground" />}
  />
);
