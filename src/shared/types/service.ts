export type ServiceResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
  status?: number;
  error?: unknown;
};
