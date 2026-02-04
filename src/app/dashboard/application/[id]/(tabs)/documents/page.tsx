import DocumentsTab from "@/features/application-detail/components/tabs/documents-tab";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDocumentsPage({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <DocumentsTab applicationId={id} />;
}
