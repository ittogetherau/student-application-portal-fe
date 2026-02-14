import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Timeline from "@/features/application-detail/components/tabs/timeline-tab";
import {
  type ApplicationRouteParams,
  getValidatedApplicationId,
} from "@/features/application-detail/utils/application-route-params";

type PageProps = {
  params: ApplicationRouteParams;
};

export default async function ApplicationTimelinePage({ params }: PageProps) {
  const id = await getValidatedApplicationId(params);

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Timeline id={id} />
      </CardContent>
    </Card>
  );
}
