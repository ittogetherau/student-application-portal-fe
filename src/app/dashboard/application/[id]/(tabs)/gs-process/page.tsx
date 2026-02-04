import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";
import GsClient from "./gs-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GSProcessPage({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <GsClient applicationId={id} />;
}
