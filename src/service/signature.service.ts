import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/shared/utils/handle-api-error";
import type { ServiceResponse } from "@/shared/types/service";

export interface SendOfferLetterResponse {
  application_id?: string;
  current_stage?: string;
  sent_at?: string;
  message?: string;
}

export interface SendOfferLetterPayload {
  student_email: string;
  student_name: string;
}

export interface SignatureParticipant {
  name: string;
  email: string;
  signing_url: string;
  signed_at: string | null;
}

export interface SignatureRequestItem {
  id: string;
  application_id: string;
  documenso_document_id: number;
  document_title: string;
  status: string;
  student: SignatureParticipant;
  agent: SignatureParticipant;
  created_at: string;
  sent_at: string | null;
  completed_at: string | null;
  signed_document_path: string | null;
}

export interface SignatureRequestResponse {
  total: number;
  items: SignatureRequestItem[];
}

class SignatureService extends ApiService {
  private readonly basePath = "signatures";

  sendOfferLetter = async (
    applicationId: string,
    payload: SendOfferLetterPayload,
  ): Promise<ServiceResponse<SendOfferLetterResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<SendOfferLetterResponse>(
        `${this.basePath}/${applicationId}/send-offer-letter`,
        payload,
        true,
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

  requestSignatures = async (
    applicationId: string,
  ): Promise<ServiceResponse<SignatureRequestResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<SignatureRequestResponse>(
        `${this.basePath}/${applicationId}/requests`,
        true,
      );
      return {
        success: true,
        message: "Signature request fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to request signatures");
    }
  };
}

const signatureService = new SignatureService();
export default signatureService;
