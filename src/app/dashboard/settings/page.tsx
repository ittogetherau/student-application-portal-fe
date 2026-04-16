import { redirect } from "next/navigation";
import { siteRoutes } from "@/shared/constants/site-routes";

export default function SettingsRedirect() {
  redirect(siteRoutes.dashboard.settings.profile);
}
