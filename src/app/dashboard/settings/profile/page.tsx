"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import agentProfileService from "@/service/agent-profile.service";
import authService from "@/service/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const normalizeValue = (value: string) => value.trim();

const hasNormalizedValueChanged = (nextValue: string, prevValue: string) =>
  normalizeValue(nextValue) !== normalizeValue(prevValue);

type ProfileViewModel = {
  email: string;
  givenName: string;
  familyName: string;
  organizationName: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  avatarUrl: string;
};

const emptyProfile: ProfileViewModel = {
  email: "",
  givenName: "",
  familyName: "",
  organizationName: "",
  phone: "",
  address: "",
  role: "",
  status: "",
  avatarUrl: "",
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const readString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return "";
};

const splitName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { givenName: "", familyName: "" };
  }

  return {
    givenName: parts[0] ?? "",
    familyName: parts.slice(1).join(" "),
  };
};

const mapCurrentUserToProfile = (
  payload: unknown,
  fallbackEmail?: string | null,
): ProfileViewModel => {
  const root = asRecord(payload);
  if (!root) {
    return {
      ...emptyProfile,
      email: readString(fallbackEmail),
    };
  }

  const user = asRecord(root.user) ?? root;
  const profile =
    asRecord(user.profile) ??
    asRecord(user.staff_profile) ??
    asRecord(root.profile);
  const mergedName = readString(user.name, profile?.name);
  const { givenName: parsedGivenName, familyName: parsedFamilyName } =
    splitName(mergedName);

  return {
    email: readString(user.email, root.email, fallbackEmail),
    givenName: readString(
      user.given_name,
      user.first_name,
      profile?.given_name,
      profile?.first_name,
      parsedGivenName,
    ),
    familyName: readString(
      user.family_name,
      user.last_name,
      profile?.family_name,
      profile?.last_name,
      parsedFamilyName,
    ),
    organizationName: readString(
      user.organization_name,
      user.agency_name,
      profile?.organization_name,
      profile?.agency_name,
    ),
    phone: readString(user.phone, profile?.phone),
    address: readString(user.address, profile?.address),
    role: readString(user.role, root.role),
    status: readString(user.status, root.status),
    avatarUrl: readString(user.avatar_url, profile?.avatar_url),
  };
};

const getInitials = (givenName: string, familyName: string, email: string) => {
  const first = givenName?.[0] ?? "";
  const last = familyName?.[0] ?? "";
  const fromName = `${first}${last}`.toUpperCase();
  if (fromName) return fromName;
  return (email?.[0] ?? "U").toUpperCase();
};

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const fallbackEmail = session?.user?.email;

  const [draftValues, setDraftValues] = useState<Partial<ProfileViewModel>>({});

  const profileQuery = useQuery({
    queryKey: ["settings", "profile", "me"],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch account profile.");
      }

      return mapCurrentUserToProfile(response.data, fallbackEmail);
    },
  });

  const profileData =
    profileQuery.data ??
    ({
      ...emptyProfile,
      email: readString(fallbackEmail),
    } as ProfileViewModel);

  const formValues: ProfileViewModel = {
    ...profileData,
    ...draftValues,
  };

  const role = readString(formValues.role, session?.user?.role).toLowerCase();
  const isAgentRole = role === "agent";

  const updateMutation = useMutation({
    mutationKey: ["settings", "profile", "update"],
    mutationFn: async () => {
      const givenName = normalizeValue(formValues.givenName);
      const familyName = normalizeValue(formValues.familyName);
      const organizationName = normalizeValue(formValues.organizationName);
      const phone = normalizeValue(formValues.phone);
      const address = normalizeValue(formValues.address);

      const profileGivenName = normalizeValue(profileData.givenName);
      const profileFamilyName = normalizeValue(profileData.familyName);
      const profileOrganizationName = normalizeValue(
        profileData.organizationName,
      );
      const profilePhone = normalizeValue(profileData.phone);
      const profileAddress = normalizeValue(profileData.address);

      const response = isAgentRole
        ? await (async () => {
            const profilePayload: {
              name?: string;
              organization_name?: string;
              phone?: string;
              address?: string;
            } = {};

            const isNameChanged =
              givenName !== profileGivenName ||
              familyName !== profileFamilyName;

            if (isNameChanged) {
              const fullName = `${givenName} ${familyName}`.trim();
              if (!fullName) {
                throw new Error(
                  "Please provide at least a first name or last name.",
                );
              }
              profilePayload.name = fullName;
            }

            if (organizationName !== profileOrganizationName) {
              if (!organizationName) {
                throw new Error("Organization name cannot be empty.");
              }
              profilePayload.organization_name = organizationName;
            }

            if (phone !== profilePhone) {
              if (!phone) {
                throw new Error("Phone number cannot be empty.");
              }
              profilePayload.phone = phone;
            }

            if (address !== profileAddress) {
              if (!address) {
                throw new Error("Address cannot be empty.");
              }
              profilePayload.address = address;
            }

            if (Object.keys(profilePayload).length === 0) {
              return {
                success: true,
                data: null,
                message: "No changes to save.",
              };
            }

            const profileResponse =
              await agentProfileService.updateCurrentAgentProfile(
                profilePayload,
              );

            if (!profileResponse.success) {
              throw new Error(
                profileResponse.message || "Failed to update account.",
              );
            }

            return (
              profileResponse ?? {
                success: true,
                data: null,
                message: "Profile updated successfully.",
              }
            );
          })()
        : await (async () => {
            const payload: Record<string, unknown> = {};

            if (givenName !== profileGivenName) {
              if (!givenName) {
                throw new Error("First name cannot be empty.");
              }
              payload.given_name = givenName;
            }

            if (familyName !== profileFamilyName) {
              if (!familyName) {
                throw new Error("Last name cannot be empty.");
              }
              payload.family_name = familyName;
            }

            if (phone !== profilePhone) {
              payload.phone = phone || null;
            }

            return authService.updateCurrentUser(payload);
          })();

      if (!response.success) {
        throw new Error(response.message || "Failed to update account.");
      }
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Profile updated successfully.");
      setDraftValues({});
      queryClient.invalidateQueries({
        queryKey: ["settings", "profile", "me"],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update account.");
    },
  });

  const hasChanges =
    Boolean(profileQuery.data) &&
    (hasNormalizedValueChanged(formValues.givenName, profileData.givenName) ||
      hasNormalizedValueChanged(
        formValues.familyName,
        profileData.familyName,
      ) ||
      hasNormalizedValueChanged(formValues.phone, profileData.phone) ||
      (isAgentRole &&
        (hasNormalizedValueChanged(
          formValues.organizationName,
          profileData.organizationName,
        ) ||
          hasNormalizedValueChanged(formValues.address, profileData.address))));

  const handleChange = (field: keyof ProfileViewModel, value: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast("No changes to save.");
      return;
    }

    await updateMutation.mutateAsync();
  };

  const isLoading = profileQuery.isLoading;
  const isSaving = updateMutation.isPending;

  if (profileQuery.isError) {
    const error = profileQuery.error as Error;
    return (
      <Card className="backdrop-blur-xl bg-background/95 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            {error.message || "Failed to load profile."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => profileQuery.refetch()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  const initials = getInitials(
    formValues.givenName,
    formValues.familyName,
    formValues.email,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-medium tracking-tight">Account Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage the account details used across your dashboard.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-background/95 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Avatar is loaded from your account profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="w-20 h-20 border shadow-sm">
            <AvatarImage src={formValues.avatarUrl} />
            <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-col">
            <Button variant="outline" size="sm" disabled>
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground">
              Avatar upload endpoint is not yet connected.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-background/95 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Profile details are fetched from auth data and saved through
            role-based APIs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="first-name"
                  placeholder="Enter your first name"
                  value={formValues.givenName}
                  onChange={(event) =>
                    handleChange("givenName", event.target.value)
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="last-name"
                  placeholder="Enter your last name"
                  value={formValues.familyName}
                  onChange={(event) =>
                    handleChange("familyName", event.target.value)
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formValues.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization Name</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="organization-name"
                  placeholder="Organization name"
                  value={formValues.organizationName}
                  onChange={(event) =>
                    handleChange("organizationName", event.target.value)
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formValues.email}
                  disabled
                />
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="address"
                  placeholder="Address"
                  value={formValues.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="role"
                  value={formValues.role || "-"}
                  disabled
                  className="capitalize"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="status"
                  value={formValues.status || "-"}
                  disabled
                  className="capitalize"
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            className="ml-auto"
            onClick={handleSave}
            disabled={isLoading || isSaving || !hasChanges}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
