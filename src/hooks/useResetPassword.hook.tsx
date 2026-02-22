"use client";

import { useMutation } from "@tanstack/react-query";

import authService from "@/service/auth.service";
import type { ServiceResponse } from "@/shared/types/service";

type ResetPasswordPayload = {
  token: string;
  new_password: string;
};

export const useResetPasswordMutation = () =>
  useMutation<ServiceResponse<unknown>, Error, ResetPasswordPayload>({
    mutationKey: ["resetPassword"],
    mutationFn: async (payload) => {
      const response = await authService.resetPassword(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });

