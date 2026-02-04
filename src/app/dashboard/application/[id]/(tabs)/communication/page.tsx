import CommunicationTab from "@/features/application-detail/components/tabs/communication-tab";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationCommunicationPage({
  params,
}: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <CommunicationTab applicationId={id} />;
}
