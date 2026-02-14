import CoeContent from "./coe-client";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function CoePage({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  return <CoeContent applicationId={id} />;
}
