import ReviewForm from "@/features/application-form/components/forms/review-form";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailsPage({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

  return <ReviewForm applicationId={id} showDetails={false} showSync={true} />;
}
