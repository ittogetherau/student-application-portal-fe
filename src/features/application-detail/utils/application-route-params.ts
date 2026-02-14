import { ensureValidApplicationId } from "@/shared/lib/validate-uuid";

export type ApplicationRouteParams = Promise<{ id: string }>;

export type ApplicationRouteProps = {
  params: ApplicationRouteParams;
};

export async function getValidatedApplicationId(
  params: ApplicationRouteParams,
) {
  const { id } = await params;
  ensureValidApplicationId(id);
  return id;
}
