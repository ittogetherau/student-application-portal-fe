import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

export interface ThreadMessage {
  id: string;
  message: string;
  author_email: string;
  author_role: string;
  author_name: string;
  created_at: string;
}

export interface CommunicationThread {
  id: string;
  subject: string;
  issue_type: string;
  target_section: string;
  priority: string;
  deadline: string | null;
  status: string;
  status_updated_at: string;
  is_internal: boolean;
  created_at: string;
  created_by_email: string;
  created_by_role: string;
  created_by_name: string;
  messages: ThreadMessage[];
}

export interface CreateThreadPayload {
  subject: string;
  issue_type: string;
  target_section: string;
  priority: string;
  deadline?: string;
  message: string;
  is_internal?: boolean;
}

class ApplicationTimelineService extends ApiService {
  private readonly basePath = "applications";

  listThreads(
    applicationId: string
  ): Promise<ServiceResponse<CommunicationThread[]>> {
    if (!applicationId) {
      return Promise.resolve({
        success: false,
        data: [],
        message: "Application id is required",
      });
    }

    return resolveServiceCall<CommunicationThread[]>(
      () => this.get(`${this.basePath}/${applicationId}/threads`, true),
      "Communication threads fetched successfully.",
      "Failed to fetch communication threads",
      []
    );
  }

  createThread(
    applicationId: string,
    payload: CreateThreadPayload
  ): Promise<ServiceResponse<CommunicationThread>> {
    if (!applicationId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Application id is required",
      });
    }

    return resolveServiceCall<CommunicationThread>(
      () => this.post(`${this.basePath}/${applicationId}/threads`, payload, true),
      "Communication thread created successfully.",
      "Failed to create communication thread"
    );
  }

  addMessage(
    applicationId: string,
    threadId: string,
    message: string
  ): Promise<ServiceResponse<ThreadMessage>> {
    if (!applicationId || !threadId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Application id and thread id are required",
      });
    }

    return resolveServiceCall<ThreadMessage>(
      () =>
        this.post(
          `${this.basePath}/${applicationId}/threads/${threadId}/messages`,
          { message },
          true
        ),
      "Message added successfully.",
      "Failed to add message to thread"
    );
  }

  updateStatus(
    applicationId: string,
    threadId: string,
    status: string
  ): Promise<ServiceResponse<CommunicationThread>> {
    if (!applicationId || !threadId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Application id and thread id are required",
      });
    }

    return resolveServiceCall<CommunicationThread>(
      () =>
        this.patch(
          `${this.basePath}/${applicationId}/threads/${threadId}/status`,
          { status },
          true
        ),
      "Thread status updated successfully.",
      "Failed to update thread status"
    );
  }
}

const applicationTimelineService = new ApplicationTimelineService();
export default applicationTimelineService;
