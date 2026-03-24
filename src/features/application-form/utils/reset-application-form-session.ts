import { useApplicationFormDataStore } from "../store/use-application-form-data.store";
import { useApplicationStepStore } from "../store/use-application-step.store";

export const resetApplicationFormSession = () => {
  useApplicationFormDataStore.getState().setApplicationId(null);
  useApplicationStepStore.getState().setStorageScope(null);
  useApplicationFormDataStore.getState().clearAllData();
  useApplicationStepStore.getState().resetNavigation();
};
