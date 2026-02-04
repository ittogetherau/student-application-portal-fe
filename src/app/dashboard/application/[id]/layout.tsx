import { ReactNode } from "react";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";
import ClientApplicationLayout from "./client-layout";

type LayoutProps = {
  params: Promise<{ id: string }>;
  children: ReactNode;
};

export default async function ApplicationLayout({
  params,
  children,
}: LayoutProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <ClientApplicationLayout id={id}>{children}</ClientApplicationLayout>;
}
