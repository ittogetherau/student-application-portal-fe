import CommunicationTab from "@/features/application-detail/components/tabs/communication-tab";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function ApplicationCommunicationPage({
  params,
}: PageProps) {
  const id = await getValidatedApplicationId(params);

  return <CommunicationTab applicationId={id} />;
}
