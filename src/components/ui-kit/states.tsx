"use client";
import { Button } from "@/components/ui/button";
import ContainerLayout from "./layout/container-layout";
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Loader, AlertCircle, SearchX, Inbox } from "lucide-react";

type Action = {
  label: string;
  onClick: () => void;
};

interface props {
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
}: props) => {
  return (
    <ContainerLayout className={className}>
      <Card className="min-h-36 flex justify-center pl-4">
        {children ? (
          children
        ) : (
          <CardContent className="flex flex-col items-center text-center">
            {icon && <div className="mb-4">{icon}</div>}
            <CardTitle>{title ? <h2>{title}</h2> : null}</CardTitle>
            <CardDescription>
              {description ? <p>{description}</p> : null}
            </CardDescription>
            <CardFooter>
              {action ? (
                <Button onClick={action.onClick}>{action.label}</Button>
              ) : null}
            </CardFooter>
          </CardContent>
        )}
      </Card>
    </ContainerLayout>
  );
};

export const LoadingState = () => (
  <BaseState>
    <div className="grid place-items-center">
      <Loader className="animate-spin text-accent" />
    </div>
  </BaseState>
);

export const ErrorState = ({
  title = "Something went wrong",
  description = "Please try again.",
  action,
  className,
}: props) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<AlertCircle className="w-12 h-12 text-destructive" />}
  />
);

export const NotFoundState = ({
  title = "Not found",
  description = "We couldn't find what you were looking for.",
  action,
  className,
}: props) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<SearchX className="w-12 h-12 text-muted-foreground" />}
  />
);

export const EmptyState = ({
  title = "No data yet",
  description = "There is nothing to display here.",
  action,
  className,
}: props) => (
  <BaseState
    title={title}
    description={description}
    action={action}
    className={className}
    icon={<Inbox className="w-12 h-12 text-muted-foreground" />}
  />
);
