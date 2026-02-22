"use client";

import { useMutation } from "@tanstack/react-query";

import authService from "@/service/auth.service";
import type { ServiceResponse } from "@/shared/types/service";
import type { ForgotPasswordValues } from "@/features/auth/utils/validations/forgot-password";

export const useForgotPasswordMutation = () =>
  useMutation<ServiceResponse<unknown>, Error, ForgotPasswordValues>({
    mutationKey: ["forgotPassword"],
    mutationFn: async (values) => {
      const response = await authService.forgotPassword({ email: values.email });
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });

