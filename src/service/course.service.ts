/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/shared/utils/handle-api-error";
import type { ServiceResponse } from "@/shared/types/service";

export interface Campus {
  id: number;
  name: string;
  venue_code: string;
  venue_name: string;
  building_name: string;
  unit_detail: string;
  street_no: string;
  street_name: string;
  sub_urb: string;
  country: number;
  state: string;
  set_active: number;
  postcode: string;
  contact_no: string;
  abn: string;
}

export interface Intake {
  id: number;
  course_type: number;
  course_id: number;
  intake_year: number;
  intake_name: string;
  intake_start: string;
  intake_end: string;
  intake_duration: number | null;
  intake_receiver: string;
  active: number;
  delivery_target: string;
  delivery_target_text: string;
  course_delivery_mode: string | null;
  course_delivery_mode_text: string;
  study_mode: string;
  online_hours: number;
  face_to_face_hours: number;
  class_start_date: string | null;
  class_end_date: string | null;
  class_start_time: string | null;
  class_end_time: string | null;
  intake_seats: number;
  restrict_enrollments_to_seats: boolean;
  total_applications: number;
  total_enrollments: number;
  pending_enrollments: number;
  can_accept_enrolments: boolean;
  remaining_seats: number;
  campuses_location: { short_name: string; name: string }[];
  campuses: Campus[];
  tuition_fee: number | null;
  domestic_fee: number | null;
  facetoface_fee: number;
  online_fee: number;
  international_offshore_fee: number;
  international_onshore_fee: number;
  fee_categorization: any[];
  fee_target_text: string;
  fee_text: string;
  fee_currency: string;
  currency_symbol: string;
  gst_included: number;
  fee_currency_gst: string;
}

export interface Course {
  id: number;
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
  couse_duration_type: number;
  duration_text: string;
  course_delivery_mode: string;
  course_delivery_mode_text: string;
  study_mode: string;
  online_hours: number;
  face_to_face_hours: number;
  maximum_weekly_study: number;
  effective_start: string;
  effective_end: string;
  campus_list: string;
  activated_now: number;
  is_fee_recurring: number;
  fee_recurring_type: string;
  is_seat_fixed: number;
  seat_limit: string;
  has_all_information: boolean;
  campuses: Campus[];
  campuses_location: { short_name: string; name: string }[];
  intakes: Intake[];
  cover_image: string;
  total_applications_count: number;
  total_enrollments_count: number;
  course_accrediation_type: string;
  tuition_fee: number;
  domestic_fee: number;
  facetoface_fee: number;
  online_fee: number;
  international_offshore_fee: number;
  international_onshore_fee: number;
  fee_categorization: {
    [key: string]: {
      label: string;
      value: number;
    };
  };
  fee_target_text: string;
  fee_text: string;
  fee_currency: string;
  currency_symbol: string;
  gst_included: number;
  fee_currency_gst: string;
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
  type?: 17 | null;
};

type IntakeListApiResponse =
  | Intake[]
  | Intake
  | {
      data?: Intake[] | Intake;
      message?: string;
      success?: number;
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
    if (Array.isArray(response)) return response;
    if (response && "data" in response) {
      if (Array.isArray(response.data)) return response.data;
      if (response.data && typeof response.data === "object") {
        return [response.data];
      }
    }
    if (response && typeof response === "object") return [response as Intake];
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
    options?: {
      campus?: string | number | null;
      includeExpiredIntakes?: 0 | 1 | boolean;
    },
  ): Promise<ServiceResponse<Intake[]>> => {
    if (!courseCode) throw new Error("Course code is required");
    try {
      const query = new URLSearchParams();
      if (options?.campus !== undefined && options?.campus !== null) {
        query.set("campus", String(options.campus));
      }
      const includeExpiredIntakes =
        options?.includeExpiredIntakes === 1 ||
        options?.includeExpiredIntakes === true
          ? 1
          : 0;
      query.set(
        "include_expired_intakes",
        String(includeExpiredIntakes),
      );

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
