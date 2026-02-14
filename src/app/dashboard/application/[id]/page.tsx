import { redirect } from "next/navigation";

import { siteRoutes } from "@/shared/constants/site-routes";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function ApplicationDetailRedirect({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  const destination = siteRoutes.dashboard.application.id.details(id);

  redirect(destination);
}
