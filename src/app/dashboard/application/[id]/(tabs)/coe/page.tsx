import CoeContent from "./coe-client";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CoePage({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <CoeContent applicationId={id} />;
}
