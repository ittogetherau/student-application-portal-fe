/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/shared/utils/handle-api-error";
import type { ServiceResponse } from "@/shared/types/service";

export interface Campus {
  id: string | number;
  name: string;
  venue_code?: string | null;
  venue_name?: string | null;
  building_name?: string | null;
  unit_detail?: string | null;
  street_no?: string | null;
  street_name?: string | null;
  sub_urb?: string | null;
  country?: string | number | null;
  state?: string | null;
  set_active?: string | number | null;
  postcode?: string | null;
  contact_no?: string | null;
  abn?: string | null;
  [key: string]: unknown;
}

export interface Intake {
  id: string | number;
  course_type: string | number;
  course_id: string | number;
  intake_year: string | number;
  intake_name: string;
  intake_start: string;
  intake_end: string;
  intake_duration: string | number | null;
  intake_receiver: string;
  active: string | number;
  delivery_target: string;
  delivery_target_text: string;
  course_delivery_mode: string | null;
  course_delivery_mode_text: string;
  study_mode: string;
  online_hours: number | string;
  face_to_face_hours: number | string;
  class_start_date: string | null;
  class_end_date: string | null;
  class_start_time: string | null;
  class_end_time: string | null;
  intake_seats: string | number;
  restrict_enrollments_to_seats: string | number | boolean;
  total_applications: string | number;
  total_enrollments: string | number;
  pending_enrollments: string | number;
  can_accept_enrolments: string | number | boolean;
  remaining_seats: string | number;
  this_student_applications?: string | number | null;
  this_student_enrolled?: string | number | null;
  campuses_location: Array<{ short_name: string; name: string } | string>;
  campuses: Campus[];
  tuition_fee?: number | string | null;
  domestic_fee?: number | string | null;
  facetoface_fee?: number | string;
  online_fee?: number | string;
  international_offshore_fee?: number | string;
  international_onshore_fee?: number | string;
  fee_categorization?: any[];
  fee_target_text?: string;
  fee_text?: string;
  fee_currency?: string;
  currency_symbol?: string;
  gst_included?: number | string;
  fee_currency_gst?: string;
  [key: string]: unknown;
}

export interface Course {
  id: string | number;
  course_type_text?: string | null;
  is_superseded: boolean;
  superseded_date: string | null;
  national_code: string;
  course_code: string;
  cricos_code: string;
  course_name: string;
  course_title: string;
  course_summary: string | null;
  delivery_target_text: string;
  course_duration: number;
  couse_duration_type: string | number;
  duration_text: string;
  course_delivery_mode: string;
  course_delivery_mode_text: string;
  study_mode: string;
  online_hours: number | string;
  face_to_face_hours: number | string;
  maximum_weekly_study: number | string;
  effective_start: string;
  effective_end: string;
  campus_list: string;
  activated_now: string | number;
  is_fee_recurring: string | number;
  fee_recurring_type: string;
  is_seat_fixed: string | number;
  seat_limit: string;
  has_all_information: boolean;
  superseededinfo?: Record<string, unknown>;
  campuses: Campus[];
  campuses_location: Array<{ short_name: string; name: string } | string>;
  intakes: Intake[];
  cover_image: string;
  total_applications_count: string | number;
  total_enrollments_count: string | number;
  this_student_applications?: string | number | null;
  this_student_enrolled?: string | number | null;
  course_accrediation_type: string;
  tuition_fee: number | string;
  domestic_fee: number | string;
  facetoface_fee: number | string;
  online_fee: number | string;
  international_offshore_fee: number | string;
  international_onshore_fee: number | string;
  fee_categorization: {
    [key: string]: {
      label: string;
      value: number | string;
    };
  };
  fee_target_text: string;
  fee_text: string;
  fee_currency: string;
  currency_symbol: string;
  gst_included: number | string;
  fee_currency_gst: string;
  [key: string]: unknown;
}

type CourseListApiResponse =
  | Course[]
  | {
      code?: number;
      success?: number;
      status?: string;
      message?: string;
      data?: Course[];
    };

export type CourseListParams = {
  campus?: number | null;
  city?: string | null;
  date?: string | null;
  include_expired_intakes?: boolean | null;
  mode?: "online" | "offline" | "facetoface" | "hybrid" | "blended" | null;
  page?: string | null;
  search?: string | null;
  student_id?: string | null;
  type?: number | null;
};

export type CourseIntakeListParams = {
  campus?: string | number | null;
  fromdate?: string | null;
  intake?: string | number | null;
  page?: number | null;
  show?: number | null;
  student_id?: string | null;
  todate?: string | null;
};

type IntakeListApiResponse =
  | Intake[]
  | Intake
  | {
      data?: Intake[] | Intake;
      code?: number | string;
      status?: string;
      message?: string;
      success?: number | boolean | string;
    };

class CourseService extends ApiService {
  private readonly coursesUrl =
    "https://churchill.galaxy360.com.au/api/v3/courses";

  private normalizeCourseList = (response: CourseListApiResponse): Course[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  private normalizeIntakes = (response: IntakeListApiResponse): Intake[] => {
    const isIntake = (value: unknown): value is Intake => {
      if (!value || typeof value !== "object") return false;
      const record = value as Record<string, unknown>;
      return (
        ("id" in record && record.id !== null && record.id !== undefined) ||
        ("intake_name" in record &&
          typeof record.intake_name === "string" &&
          record.intake_name.trim().length > 0)
      );
    };

    if (Array.isArray(response)) {
      return response.filter(isIntake);
    }

    if (response && typeof response === "object" && "data" in response) {
      const payload = response.data;
      if (Array.isArray(payload)) return payload.filter(isIntake);
      if (isIntake(payload)) return [payload];
      return [];
    }

    if (isIntake(response)) return [response];
    return [];
  };

  listCourses = async (
    params?: CourseListParams,
  ): Promise<ServiceResponse<Course[]>> => {
    try {
      const query = new URLSearchParams();
      if (typeof params?.campus === "number") {
        query.set("campus", String(params.campus));
      }
      if (params?.city) query.set("city", params.city);
      if (params?.date) query.set("date", params.date);
      if (typeof params?.include_expired_intakes === "boolean") {
        query.set(
          "include_expired_intakes",
          params.include_expired_intakes ? "1" : "0",
        );
      }
      if (params?.mode) query.set("mode", params.mode);
      if (params?.page) query.set("page", params.page);
      if (params?.search) query.set("search", params.search);
      if (params?.student_id) query.set("student_id", params.student_id);
      if (params?.type) query.set("type", String(params.type));

      const endpoint = query.toString()
        ? `${this.coursesUrl}?${query.toString()}`
        : this.coursesUrl;

      const response = await this.get<CourseListApiResponse>(endpoint);
      const courses = this.normalizeCourseList(response);

      return {
        success: true,
        message: "Courses fetched.",
        data: courses,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch courses", []);
    }
  };

  listCourseIntakes = async (
    courseCode: string,
    options?: CourseIntakeListParams,
  ): Promise<ServiceResponse<Intake[]>> => {
    if (!courseCode) throw new Error("Course code is required");
    try {
      const query = new URLSearchParams();
      if (options?.campus !== undefined && options?.campus !== null) {
        query.set("campus", String(options.campus));
      }
      if (options?.fromdate) query.set("fromdate", options.fromdate);
      if (options?.intake !== undefined && options?.intake !== null) {
        query.set("intake", String(options.intake));
      }
      if (typeof options?.page === "number") {
        query.set("page", String(options.page));
      }
      if (typeof options?.show === "number") {
        query.set("show", String(options.show));
      }
      if (options?.student_id) query.set("student_id", options.student_id);
      if (options?.todate) query.set("todate", options.todate);

      const response = await this.get<IntakeListApiResponse>(
        `${this.coursesUrl}/${encodeURIComponent(courseCode)}/intakes?${query.toString()}`,
      );
      const intakes = this.normalizeIntakes(response);
      return {
        success: true,
        message: "Course intakes fetched.",
        data: intakes,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch course intakes", []);
    }
  };
}

const courseService = new CourseService();
export default courseService;
