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
  attachments?: ThreadMessageAttachment[];
}

export interface CommunicationThread {
  id: string;
  agent?: ThreadParticipant | null;
  assigned_staff?: ThreadParticipant | null;
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
  application_id?: string;
}

export interface ThreadParticipant {
  id: string;
  email: string;
  name: string | null;
}

export interface CreateThreadPayload {
  subject: string;
  issue_type?: string;
  target_section?: string;
  priority?: string;
  deadline?: string;
  message: string;
  is_internal?: boolean;
}

export interface StaffThreadSummary {
  id: string;
  application_id: string;
  subject: string;
  priority: string;
  status: string;
  deadline: string | null;
  status_updated_at: string;
}

export interface ThreadMessageAttachment {
  id?: string;
  url: string;
  file_name?: string;
  mime_type?: string;
}

export interface AddThreadMessagePayload {
  message: string;
  attachments?: File[] | FileList;
}

class ApplicationThreadsService extends ApiService {
  private readonly basePath = "applications";

  listStaffThreads(): Promise<ServiceResponse<StaffThreadSummary[]>> {
    return resolveServiceCall<StaffThreadSummary[]>(
      () => this.get("/staff/threads", true),
      "Staff threads fetched successfully.",
      "Failed to fetch staff threads",
      []
    );
  }

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
      async () => {
        const data = await this.get<
          CommunicationThread[] | Record<string, CommunicationThread>
        >(`${this.basePath}/${applicationId}/threads`, true);
        return Array.isArray(data) ? data : Object.values(data ?? {});
      },
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
      () =>
        this.post(`${this.basePath}/${applicationId}/threads`, payload, true),
      "Communication thread created successfully.",
      "Failed to create communication thread"
    );
  }

  addMessage(
    applicationId: string,
    threadId: string,
    payload: AddThreadMessagePayload
  ): Promise<ServiceResponse<ThreadMessage>> {
    if (!applicationId || !threadId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Application id and thread id are required",
      });
    }

    const files = Array.from(payload.attachments ?? []);
    const message = payload.message?.trim() || "";

    if (files.length > 0) {
      const formData = new FormData();
      formData.append("message", message);
      files.forEach((file) => {
        formData.append("attachments", file, file.name);
      });

      return resolveServiceCall(
        () =>
          this.post(
            `${this.basePath}/${applicationId}/threads/${threadId}/messages`,
            formData,
            true
          ),
        "Message added successfully.",
        "Failed to add message to thread"
      );
    }

    return resolveServiceCall(
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

  updatePriority(
    applicationId: string,
    threadId: string,
    priority: string
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
          `${this.basePath}/${applicationId}/threads/${threadId}/priority`,
          { priority },
          true
        ),
      "Thread priority updated successfully.",
      "Failed to update thread priority"
    );
  }
}

const applicationThreadsService = new ApplicationThreadsService();
export default applicationThreadsService;
