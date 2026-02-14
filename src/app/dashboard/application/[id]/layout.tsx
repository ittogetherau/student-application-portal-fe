import { ReactNode } from "react";
import ClientApplicationLayout from "./client-layout";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type LayoutProps = {
  params: ApplicationRouteParams;
  children: ReactNode;
};

export default async function ApplicationLayout({
  params,
  children,
}: LayoutProps) {
  const id = await getValidatedApplicationId(params);

  return <ClientApplicationLayout id={id}>{children}</ClientApplicationLayout>;
}
