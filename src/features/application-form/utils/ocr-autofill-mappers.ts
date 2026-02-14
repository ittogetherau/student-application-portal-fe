import type { OcrProcessResult } from "@/features/application-form/hooks/use-ocr-autofill-upload.hook";
import type {
  LanguageAndCultureFormValues,
  PersonalDetailsValues,
} from "@/features/application-form/validations";
import type { OcrResult } from "@/service/document.service";

type PersonalDetailsBindings = {
  getValue: (key: keyof PersonalDetailsValues) => unknown;
  setValue: (
    key: keyof PersonalDetailsValues,
    value: PersonalDetailsValues[keyof PersonalDetailsValues],
  ) => void;
};

export const mapPassportOcrToPersonalDetails = (
  ocrData: OcrResult,
  bindings: PersonalDetailsBindings,
): OcrProcessResult<Record<string, unknown>> => {
  let personalDetailsData =
    ocrData.sections.personal_details?.extracted_data ?? null;
  const pendingCount = ocrData.metadata?.ocr_pending || 0;

  if (
    personalDetailsData &&
    typeof personalDetailsData === "object" &&
    !Array.isArray(personalDetailsData)
  ) {
    const transformedData: Record<string, unknown> = {
      ...personalDetailsData,
    };

    if (
      transformedData.expiry_date &&
      !transformedData.passport_expiry &&
      typeof transformedData.expiry_date === "string"
    ) {
      transformedData.passport_expiry = transformedData.expiry_date;
    }

    if (typeof transformedData.gender === "string") {
      const gender = transformedData.gender.toUpperCase();
      if (gender === "M" || gender === "MALE") transformedData.gender = "Male";
      if (gender === "F" || gender === "FEMALE")
        transformedData.gender = "Female";
    }

    personalDetailsData = transformedData;
  }

  if (!personalDetailsData || pendingCount !== 0) {
    return { isComplete: false };
  }

  let fieldsPopulated = 0;

  Object.entries(personalDetailsData).forEach(([key, value]) => {
    const fieldKey = key as keyof PersonalDetailsValues;
    const currentValue = bindings.getValue(fieldKey);

    if (currentValue) return;
    if (value === null || value === undefined || value === "") return;

    bindings.setValue(
      fieldKey,
      value as PersonalDetailsValues[keyof PersonalDetailsValues],
    );
    fieldsPopulated++;
  });

  return {
    isComplete: true,
    summary: personalDetailsData as Record<string, unknown>,
    fieldsPopulated,
  };
};

type LanguageFormBindings = {
  getValue: (key: keyof LanguageAndCultureFormValues) => unknown;
  setValue: (
    key: keyof LanguageAndCultureFormValues,
    value: LanguageAndCultureFormValues[keyof LanguageAndCultureFormValues],
  ) => void;
  markEnglishTestComplete: () => void;
  triggerValidation: () => void;
};

type TestTypeOption = {
  value: string;
  label: string;
};

export const mapEnglishTestOcrToLanguageForm = (
  ocrData: OcrResult,
  bindings: LanguageFormBindings,
  testTypeOptions: TestTypeOption[],
): OcrProcessResult<Record<string, unknown>> => {
  const languageData =
    ocrData.sections.language_cultural?.extracted_data ?? null;
  const pendingCount = ocrData.metadata?.ocr_pending || 0;

  if (!languageData || pendingCount !== 0) {
    return { isComplete: false };
  }

  let fieldsPopulated = 0;

  const setIfEmpty = (
    key: keyof LanguageAndCultureFormValues,
    value: unknown,
  ) => {
    const currentValue = bindings.getValue(key);
    if (
      !currentValue &&
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      bindings.setValue(
        key,
        value as LanguageAndCultureFormValues[keyof LanguageAndCultureFormValues],
      );
      fieldsPopulated++;
    }
  };

  if (typeof languageData.test_type === "string") {
    const testTypeStr = languageData.test_type.toUpperCase().trim();
    const matchedOption = testTypeOptions.find(
      (opt) =>
        opt.value.toUpperCase() === testTypeStr ||
        opt.label.toUpperCase().includes(testTypeStr),
    );
    if (matchedOption) {
      setIfEmpty("english_test_type", matchedOption.value);
    } else {
      setIfEmpty("english_test_type", "other");
    }
  }

  if (languageData.overall_score) {
    setIfEmpty("english_test_overall", String(languageData.overall_score));
  }

  const testDate =
    languageData.test_date || languageData.date_of_test || languageData.date;
  if (testDate) {
    setIfEmpty("english_test_date", String(testDate));
  }

  const scores = languageData.component_scores;
  if (scores && typeof scores === "object" && !Array.isArray(scores)) {
    const scoreMap = scores as Record<string, unknown>;
    if (scoreMap.listening) {
      setIfEmpty("english_test_listening", String(scoreMap.listening));
    }
    if (scoreMap.reading) {
      setIfEmpty("english_test_reading", String(scoreMap.reading));
    }
    if (scoreMap.writing) {
      setIfEmpty("english_test_writing", String(scoreMap.writing));
    }
    if (scoreMap.speaking) {
      setIfEmpty("english_test_speaking", String(scoreMap.speaking));
    }
  }

  bindings.markEnglishTestComplete();
  bindings.triggerValidation();

  return {
    isComplete: true,
    summary: languageData,
    fieldsPopulated,
  };
};
