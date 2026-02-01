import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { OcrResult } from "@/service/document.service";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";

type FormDataState = {
  // User input data for each step
  stepData: Record<number, unknown>;
  // OCR extracted data (used as defaults)
  ocrData: Record<number, unknown>;
  // Application ID
  applicationId: string | null;

  // Actions
  setApplicationId: (id: string | null) => void;
  setStepData: <T>(stepId: number, data: T) => void;
  getStepData: <T>(stepId: number) => T | undefined;
  setOcrData: <T>(stepId: number, data: T) => void;
  getOcrData: <T>(stepId: number) => T | undefined;
  getMergedStepData: <T>(stepId: number) => T | undefined;
  clearStepData: (stepId: number) => void;
  clearAllData: () => void;
  populateFromApiResponse: (apiResponse: ApplicationDetailResponse) => void;
  populateFromOcrResult: (ocrResult: OcrResult) => void;
  // Hydration status
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

// Helper to merge OCR data with user data (user data takes precedence)
const mergeData = <T>(
  ocrData: T | undefined,
  userData: T | undefined
): T | undefined => {
  if (!ocrData && !userData) return undefined;
  if (!ocrData) return userData;
  if (!userData) return ocrData;

  // For arrays, return user data if exists, otherwise OCR data
  if (Array.isArray(userData)) return userData as T;
  if (Array.isArray(ocrData)) return ocrData as T;

  // If both are objects, merge them deeply (user data takes precedence)
  if (
    typeof ocrData === "object" &&
    typeof userData === "object" &&
    !Array.isArray(ocrData) &&
    !Array.isArray(userData) &&
    ocrData !== null &&
    userData !== null
  ) {
    const merged = { ...ocrData } as Record<string, unknown>;

    // Merge each field: user data takes precedence, but fill empty fields with OCR data
    Object.keys(userData as Record<string, unknown>).forEach((key) => {
      const userValue = (userData as Record<string, unknown>)[key];
      const ocrValue = (ocrData as Record<string, unknown>)[key];

      // If user value is null or undefined, use OCR value as fallback
      if (userValue === null || userValue === undefined) {
        if (ocrValue !== undefined) {
          merged[key] = ocrValue;
        }
      } else {
        merged[key] = userValue;
      }
    });

    // Add any OCR fields that don't exist in user data
    Object.keys(ocrData as Record<string, unknown>).forEach((key) => {
      if (!(key in merged)) {
        merged[key] = (ocrData as Record<string, unknown>)[key];
      }
    });

    return merged as T;
  }

  // For primitives, user data takes precedence
  return userData;
};

export const useApplicationFormDataStore = create<FormDataState>()(
  persist(
    (set, get) => ({
      stepData: {},
      ocrData: {},
      applicationId: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      setApplicationId: (id) => {
        set({ applicationId: id });
      },

      setStepData: <T>(stepId: number, data: T) => {
        set((state) => ({
          stepData: {
            ...state.stepData,
            [stepId]: data,
          },
        }));
      },

      getStepData: <T>(stepId: number): T | undefined => {
        const state = get();
        return (state.stepData[stepId] as T) || undefined;
      },

      setOcrData: <T>(stepId: number, data: T) => {
        set((state) => {
          // Always store OCR data - it will be used as default when merging
          const newOcrData = {
            ...state.ocrData,
            [stepId]: data,
          };

          // If user hasn't filled this step yet, prefill with OCR data
          const existingUserData = state.stepData[stepId];
          if (!existingUserData) {
            return {
              ocrData: newOcrData,
              stepData: {
                ...state.stepData,
                [stepId]: data, // Prefill with OCR data
              },
            };
          }

          // User data exists, just update OCR data
          return {
            ocrData: newOcrData,
          };
        });
      },

      getOcrData: <T>(stepId: number): T | undefined => {
        const state = get();
        return (state.ocrData[stepId] as T) || undefined;
      },

      getMergedStepData: <T>(stepId: number): T | undefined => {
        const state = get();
        const ocrData = state.ocrData[stepId] as T | undefined;
        const userData = state.stepData[stepId] as T | undefined;
        return mergeData(ocrData, userData);
      },

      clearStepData: (stepId: number) => {
        set((state) => {
          const newStepData = { ...state.stepData };
          delete newStepData[stepId];
          return { stepData: newStepData };
        });
      },

      clearAllData: () => {
        useApplicationStepStore.getState().clearDirtySteps();
        set({
          stepData: {},
          ocrData: {},
          applicationId: null,
        });
      },

      populateFromApiResponse: (apiResponse: ApplicationDetailResponse) => {
        console.log("[Store] populateFromApiResponse", {
          applicationId: apiResponse.id,
          hasPersonalDetails: !!apiResponse.personal_details,
          hasEmergencyContacts: !!apiResponse.emergency_contacts?.length,
          hasLanguageCultural: !!apiResponse.language_cultural_data,
          hasDisabilitySupport: !!apiResponse.disability_support,
          hasUsi: !!apiResponse.usi,
          hasEnrollment: !!apiResponse.enrollment_data,
        });
        set((state) => {
          // Clear previous data to prevent leaking between applications
          const newStepData: Record<number, unknown> = {};

          // Step 0: Enrollment
          if (apiResponse.enrollment_data) {
            const enrollment = apiResponse.enrollment_data as Record<
              string,
              unknown
            >;
            const courseId =
              (enrollment.courseId as number | undefined) ??
              (enrollment.course_id as number | undefined) ??
              (enrollment.course as number | undefined);
            const intakeId =
              (enrollment.intakeId as number | undefined) ??
              (enrollment.intake_id as number | undefined) ??
              (enrollment.intake as number | undefined);
            const campusId =
              (enrollment.campusId as number | undefined) ??
              (enrollment.campus_id as number | undefined) ??
              (enrollment.campus as number | undefined);

            newStepData[0] = {
              courseId,
              intakeId,
              campusId,
              course: courseId,
              intake: intakeId,
              campus: campusId,
            };
          }

          // Map API response fields to step IDs
          // Step 1: Personal Details
          if (apiResponse.personal_details) {
            newStepData[1] = apiResponse.personal_details;
          }

          // Step 2: Emergency Contact
          if (apiResponse.emergency_contacts) {
            newStepData[2] = { contacts: apiResponse.emergency_contacts };
          }

          // Step 3 (Health Cover) is hidden; skip prefilling.

          // Step 4: Language & Culture
          if (apiResponse.language_cultural_data) {
            newStepData[4] = apiResponse.language_cultural_data;
          }

          // Step 5: Disability Support
          if (apiResponse.disability_support) {
            const ds = { ...apiResponse.disability_support } as Record<
              string,
              unknown
            >;

            // Normalize has_disability
            if (typeof ds.has_disability === "boolean") {
              ds.has_disability = ds.has_disability ? "Yes" : "No";
            }

            // Map legacy disability_type string to booleans if needed
            if (
              ds.has_disability === "Yes" &&
              ds.disability_type &&
              typeof ds.disability_type === "string"
            ) {
              const types = ds.disability_type.toLowerCase();
              if (types.includes("hearing") || types.includes("deaf"))
                ds.disability_hearing = true;
              if (types.includes("physical")) ds.disability_physical = true;
              if (types.includes("intellectual"))
                ds.disability_intellectual = true;
              if (types.includes("learning")) ds.disability_learning = true;
              if (types.includes("mental")) ds.disability_mental_illness = true;
              if (types.includes("brain")) ds.disability_acquired_brain = true;
              if (types.includes("vision")) ds.disability_vision = true;
              if (types.includes("medical"))
                ds.disability_medical_condition = true;
              if (types.includes("other")) ds.disability_other = true;
            }

            newStepData[5] = ds;
          }

          // Step 6 (Schooling) is hidden; skip prefilling.

          // Step 7: Qualifications
          if (apiResponse.qualifications) {
            const qualificationsSource = apiResponse.qualifications as
              | unknown[]
              | Record<string, unknown>;
            const qualifications = Array.isArray(qualificationsSource)
              ? qualificationsSource
              : Array.isArray(qualificationsSource?.qualifications)
              ? (qualificationsSource.qualifications as unknown[])
              : [];
            newStepData[7] = {
              has_qualifications: qualifications.length > 0 ? "Yes" : "No",
              qualifications,
            };
          }

          // Step 8 (Employment) is hidden; skip prefilling.

          // Step 9: USI
          if (apiResponse.usi) {
            newStepData[9] = { usi: apiResponse.usi };
          }

          // Step 10 (Additional Services) is hidden; skip prefilling.

          // Step 11 (Survey) is hidden; skip prefilling.

          // Also restore completed steps in the navigation store
          useApplicationStepStore.getState().restoreCompletedSteps(newStepData);

          console.log("[Store] mapped stepData keys", {
            keys: Object.keys(newStepData),
            stepData: newStepData,
          });

          return { stepData: newStepData };
        });
      },

      populateFromOcrResult: (ocrResult: OcrResult) => {
        console.log("[Store] populateFromOcrResult called with:", ocrResult);
        set((state) => {
          const newOcrData = { ...state.ocrData };

          // Map OCR sections to step IDs
          // Step 1: Personal Details
          if (ocrResult.sections.personal_details?.extracted_data) {
            const extractedData =
              ocrResult.sections.personal_details.extracted_data;
            if (
              extractedData &&
              typeof extractedData === "object" &&
              !Array.isArray(extractedData)
            ) {
              const dataObj = extractedData as Record<string, unknown>;
              const transformedData: Record<string, unknown> = { ...dataObj };

              // Map expiry_date -> passport_expiry
              if (dataObj.expiry_date && !dataObj.passport_expiry) {
                transformedData.passport_expiry = dataObj.expiry_date;
                delete transformedData.expiry_date;
              }

              // Normalize gender (M -> Male, F -> Female)
              if (dataObj.gender) {
                const gender = String(dataObj.gender).toUpperCase();
                if (gender === "M" || gender === "MALE") {
                  transformedData.gender = "Male";
                } else if (gender === "F" || gender === "FEMALE") {
                  transformedData.gender = "Female";
                }
              }

              newOcrData[1] = transformedData;
            } else {
              newOcrData[1] = extractedData;
            }
          }
          // Step 4: Language & Culture
          if (ocrResult.sections.language_cultural?.extracted_data) {
            const extractedData =
              ocrResult.sections.language_cultural.extracted_data;
            // Transform OCR field names to match form field names
            if (
              extractedData &&
              typeof extractedData === "object" &&
              !Array.isArray(extractedData)
            ) {
              const dataObj = extractedData as Record<string, unknown>;
              const transformedData: Record<string, unknown> = { ...dataObj };

              // Map test_type -> english_test_type
              if (dataObj.test_type && !dataObj.english_test_type) {
                transformedData.english_test_type = dataObj.test_type;
                delete transformedData.test_type;
              }

              // Map overall_score -> english_test_score
              if (dataObj.overall_score && !dataObj.english_test_score) {
                transformedData.english_test_score = dataObj.overall_score;
                delete transformedData.overall_score;
              }

              newOcrData[4] = transformedData;
            } else {
              newOcrData[4] = extractedData;
            }
          }

          // Update OCR data and prefill step data if user hasn't filled it yet
          // Always prefill with OCR data on first load, even if stepData exists but is empty
          const newStepData = { ...state.stepData };
          Object.keys(newOcrData).forEach((stepIdStr) => {
            const stepId = parseInt(stepIdStr, 10);
            if (!isNaN(stepId)) {
              const existingStepData = newStepData[stepId];
              const ocrDataForStep = newOcrData[stepId];

              if (!ocrDataForStep) return;

              // Check if existing step data is empty/null/undefined
              const isStepDataEmpty =
                !existingStepData ||
                (typeof existingStepData === "object" &&
                  !Array.isArray(existingStepData) &&
                  existingStepData !== null &&
                  Object.keys(existingStepData).length === 0) ||
                (Array.isArray(existingStepData) &&
                  existingStepData.length === 0);

              // If no user data exists or it's empty, prefill with OCR data
              // Force update to ensure data is always available
              if (isStepDataEmpty) {
                newStepData[stepId] = ocrDataForStep;
              }
            }
          });

          // Force a state update to trigger re-renders in components using this data
          // This ensures components see the updated data immediately

          return {
            ocrData: newOcrData,
            stepData: newStepData,
          };
        });
      },
    }),
    {
      name: "application-form-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        applicationId: state.applicationId,
        stepData: state.stepData,
        ocrData: state.ocrData,
      }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
