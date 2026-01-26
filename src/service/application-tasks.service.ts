import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

export interface GalaxyTaskStatusResponse {
  task_id?: string;
  status?: string;
  message?: string;
  updated_at?: string;
  [key: string]: unknown;
}

class ApplicationTasksService extends ApiService {
  private readonly basePath = "admin/galaxy/task-status";

  getGalaxyTaskStatus = async (
    taskId: string
  ): Promise<ServiceResponse<GalaxyTaskStatusResponse>> => {
    if (!taskId) throw new Error("Task id is required");
    try {
      const data = await this.get<GalaxyTaskStatusResponse>(
        `${this.basePath}/${taskId}`,
        true
      );
      return {
        success: true,
        message: "Task status fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch task status");
    }
  };
}

const applicationTasksService = new ApplicationTasksService();
export default applicationTasksService;
