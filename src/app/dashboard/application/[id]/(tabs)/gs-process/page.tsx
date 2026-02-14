import GsClient from "./gs-client";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function GSProcessPage({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  return <GsClient applicationId={id} />;
}
