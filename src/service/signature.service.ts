import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

export interface SendOfferLetterResponse {
  application_id?: string;
  current_stage?: string;
  sent_at?: string;
  message?: string;
}

export interface SendOfferLetterPayload {
  student_email: string;
}

class SignatureService extends ApiService {
  private readonly basePath = "signatures";

  sendOfferLetter = async (
    applicationId: string,
    payload: SendOfferLetterPayload
  ): Promise<ServiceResponse<SendOfferLetterResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<SendOfferLetterResponse>(
        `${this.basePath}/${applicationId}/send-offer-letter`,
        payload,
        true
      );
      return {
        success: true,
        message: "Offer letter sent successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to send offer letter");
    }
  };
}

const signatureService = new SignatureService();
export default signatureService;
