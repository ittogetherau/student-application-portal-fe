import { StoreApi, UseBoundStore, create } from "zustand";
import type { ApplicationListParams } from "@/service/application.service";

interface ApplicationFiltersState {
  filters: ApplicationListParams;
  setFilters: (filters: ApplicationListParams) => void;
  resetFilters: (initial: ApplicationListParams) => void;
}

type ApplicationFiltersStoreHook = UseBoundStore<
  StoreApi<ApplicationFiltersState>
>;

const createApplicationFiltersStore = (
  initial: ApplicationListParams,
): ApplicationFiltersStoreHook =>
  create<ApplicationFiltersState>((set) => ({
    filters: initial,
    setFilters: (filters) => set({ filters }),
    resetFilters: (nextFilters) => set({ filters: nextFilters }),
  }));

const applicationFiltersStores = new Map<string, ApplicationFiltersStoreHook>();

const getApplicationFiltersStore = (
  key: string,
  initial: ApplicationListParams,
): ApplicationFiltersStoreHook => {
  const existing = applicationFiltersStores.get(key);
  if (existing) return existing;
  const newStore = createApplicationFiltersStore(initial);
  applicationFiltersStores.set(key, newStore);
  return newStore;
};

export const useApplicationFiltersStoreByKey = (
  key: string,
  initial: ApplicationListParams,
) => getApplicationFiltersStore(key, initial);
