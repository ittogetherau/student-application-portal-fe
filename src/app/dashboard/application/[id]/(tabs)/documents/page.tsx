import DocumentsTab from "@/features/application-detail/components/tabs/documents-tab";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function ApplicationDocumentsPage({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  return <DocumentsTab applicationId={id} />;
}
