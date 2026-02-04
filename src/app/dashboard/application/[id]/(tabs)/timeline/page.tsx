import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Timeline from "@/features/application-detail/components/tabs/timeline-tab";
import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationTimelinePage({ params }: PageProps) {
  const { id } = await params;

  ensureValidApplicationId(id);

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
