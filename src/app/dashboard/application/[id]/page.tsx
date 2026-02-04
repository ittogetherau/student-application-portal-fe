import { redirect } from "next/navigation";

import { siteRoutes } from "@/constants/site-routes";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailRedirect({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  const destination = siteRoutes.dashboard.application.id.details(id);

  redirect(destination);
}
