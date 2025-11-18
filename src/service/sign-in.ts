import { setBrowserAuthSession, type UserRole } from "@/lib/auth";
import type { SignInValues } from "@/validation/sign-in";

type NonAdminRole = Exclude<UserRole, "admin">;

/**
 * Placeholder admin sign-in service.
 * Replace this stub with a real API integration.
 */
export const adminSignIn = async (payload: SignInValues): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.info("Admin sign-in", payload);
  setBrowserAuthSession({ email: payload.email, role: "admin" });
};

/**
 * Placeholder public (non-admin) sign-in service.
 * Swap this out for your production API request.
 */
export const publicSignIn = async (
  payload: SignInValues,
  role: NonAdminRole,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.info(`${role} portal sign-in`, payload);
  setBrowserAuthSession({ email: payload.email, role });
};
