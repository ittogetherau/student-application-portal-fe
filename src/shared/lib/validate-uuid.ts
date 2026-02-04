import { redirect } from "next/navigation";

import { siteRoutes } from "@/constants/site-routes";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ensureValidApplicationId = (id: string) => {
  if (!UUID_REGEX.test(id)) redirect(siteRoutes.dashboard.application.root);

  return id;
};
