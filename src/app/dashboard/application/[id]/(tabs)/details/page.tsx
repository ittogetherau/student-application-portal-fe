import ReviewForm from "@/features/application-form/components/forms/review-form";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function ApplicationDetailsPage({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  return <ReviewForm applicationId={id} showDetails={false} showSync={true} />;
}
