/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

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

export interface CourseListResponse {
    code: number;
    success: number;
    status: string;
    message: string;
    data: Course[];
}

export interface EnrollmentPayload {
    course: number;
    intake: number;
    campus: number;
}

class CourseService extends ApiService {
    private readonly coursesUrl = "https://churchill.galaxy360.com.au/api/v3/courses";

    listCourses = async (): Promise<ServiceResponse<Course[]>> => {
        try {
            // Since this is a full URL, we might need a custom approach or see if ApiService handles it
            // For now, I'll use the full URL directly if possible, or assume it's proxied.
            // Given the user request, I'll fetch it.
            const response = await this.get<CourseListResponse>(this.coursesUrl, false);

            return {
                success: response.success === 1,
                message: response.message,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error, "Failed to fetch courses", []);
        }
    };

    saveEnrollment = async (
        applicationId: string,
        payload: EnrollmentPayload
    ): Promise<ServiceResponse<any>> => {
        if (!applicationId) throw new Error("Application ID is required");
        try {
            const path = `applications/${applicationId}/steps/0/enrollment`;
            const data = await this.post<any>(path, payload, true);
            return {
                success: true,
                message: "Enrollment saved successfully.",
                data,
            };
        } catch (error) {
            return handleApiError(error, "Failed to save enrollment");
        }
    };
}

const courseService = new CourseService();
export default courseService;
