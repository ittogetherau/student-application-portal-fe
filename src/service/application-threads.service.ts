import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

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
  agent?: ThreadParticipant | null;
  assigned_staff?: ThreadParticipant | null;
  subject: string;
  priority: string;
  status: string;
  deadline: string | null;
  status_updated_at: string;
}

export interface StaffThreadFilters {
  title?: string;
  s_student?: string;
  s_staff?: string;
  agent?: string;
  agent_id?: string;
  status?: string;
  priority?: string;
  date?: string;
  deadline?: string;
  section?: string;
  active_agent?: boolean;
  sort_by?: "created_at" | "deadline";
  sort_order?: "asc" | "desc";
}

export interface ApplicationThreadFilters {
  title?: string;
  status?: string;
  priority?: string;
  deadline?: string;
  sort_by?: "created_at" | "deadline";
}

export interface UnresolvedThreadSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  target_section: string;
  deadline: string | null;
  created_at: string;
  status_updated_at: string;
}

export interface UnresolvedThreadsResponse {
  application_id: string;
  total_threads: number;
  unresolved_count: number;
  all_threads_completed: boolean;
  unresolved_threads: UnresolvedThreadSummary[];
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

  listStaffThreads(
    filters: StaffThreadFilters = {},
  ): Promise<ServiceResponse<StaffThreadSummary[]>> {
    const params = {
      title: filters.title?.trim() || undefined,
      s_student: filters.s_student?.trim() || undefined,
      s_staff: filters.s_staff?.trim() || undefined,
      agent: filters.agent?.trim() || undefined,
      agent_id: filters.agent_id?.trim() || undefined,
      status: filters.status?.trim() || undefined,
      priority: filters.priority?.trim() || undefined,
      date: filters.date?.trim() || undefined,
      deadline: filters.deadline?.trim() || undefined,
      section: filters.section?.trim() || undefined,
      active_agent:
        typeof filters.active_agent === "boolean"
          ? filters.active_agent
          : undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    };

    return resolveServiceCall<StaffThreadSummary[]>(
      async () => {
        const data = await this.get<
          StaffThreadSummary[] | Record<string, StaffThreadSummary>
        >("/staff/threads", true, { params });
        return Array.isArray(data) ? data : Object.values(data ?? {});
      },
      "Staff threads fetched successfully.",
      "Failed to fetch staff threads",
      [],
    );
  }

  listThreads(
    applicationId: string,
    filters: ApplicationThreadFilters = {},
  ): Promise<ServiceResponse<CommunicationThread[]>> {
    if (!applicationId) {
      return Promise.resolve({
        success: false,
        data: [],
        message: "Application id is required",
      });
    }

    const params = {
      title: filters.title?.trim() || undefined,
      status: filters.status?.trim() || undefined,
      priority: filters.priority?.trim() || undefined,
      deadline: filters.deadline?.trim() || undefined,
      sort_by: filters.sort_by,
    };

    return resolveServiceCall<CommunicationThread[]>(
      async () => {
        const data = await this.get<
          CommunicationThread[] | Record<string, CommunicationThread>
        >(`${this.basePath}/${applicationId}/threads`, true, { params });
        return Array.isArray(data) ? data : Object.values(data ?? {});
      },
      "Communication threads fetched successfully.",
      "Failed to fetch communication threads",
      [],
    );
  }

  getThread(
    applicationId: string,
    threadId: string,
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
        this.get(
          `${this.basePath}/${applicationId}/threads/${threadId}`,
          true,
        ),
      "Communication thread fetched successfully.",
      "Failed to fetch communication thread",
    );
  }

  getUnresolvedThreads(
    applicationId: string,
  ): Promise<ServiceResponse<UnresolvedThreadsResponse>> {
    if (!applicationId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Application id is required",
      });
    }

    const defaultPayload: UnresolvedThreadsResponse = {
      application_id: applicationId,
      total_threads: 0,
      unresolved_count: 0,
      all_threads_completed: true,
      unresolved_threads: [],
    };

    return resolveServiceCall<UnresolvedThreadsResponse>(
      () =>
        this.get(`${this.basePath}/${applicationId}/threads/unresolved`, true),
      "Unresolved communication threads fetched successfully.",
      "Failed to fetch unresolved communication threads",
      defaultPayload,
    );
  }

  createThread(
    applicationId: string,
    payload: CreateThreadPayload,
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
      "Failed to create communication thread",
    );
  }

  addMessage(
    applicationId: string,
    threadId: string,
    payload: AddThreadMessagePayload,
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
            true,
          ),
        "Message added successfully.",
        "Failed to add message to thread",
      );
    }

    return resolveServiceCall(
      () =>
        this.post(
          `${this.basePath}/${applicationId}/threads/${threadId}/messages`,
          { message },
          true,
        ),
      "Message added successfully.",
      "Failed to add message to thread",
    );
  }

  updateStatus(
    applicationId: string,
    threadId: string,
    status: string,
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
          true,
        ),
      "Thread status updated successfully.",
      "Failed to update thread status",
    );
  }

  updatePriority(
    applicationId: string,
    threadId: string,
    priority: string,
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
          true,
        ),
      "Thread priority updated successfully.",
      "Failed to update thread priority",
    );
  }
}

const applicationThreadsService = new ApplicationThreadsService();
export default applicationThreadsService;
