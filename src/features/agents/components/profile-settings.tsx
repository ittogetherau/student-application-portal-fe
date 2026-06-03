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
import { useUpdateCurrentAgentProfileMutation } from "@/features/agents/hooks/useAgentProfile.hook";
import agentProfileService from "@/service/agent-profile.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const normalizeValue = (value: string) => value.trim();

const hasNormalizedValueChanged = (nextValue: string, prevValue: string) =>
  normalizeValue(nextValue) !== normalizeValue(prevValue);

type ProfileViewModel = {
  email: string;
  organizationName: string;
  phone: string;
  address: string;
};

const emptyProfile: ProfileViewModel = {
  email: "",
  organizationName: "",
  phone: "",
  address: "",
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

const mapCurrentAgentProfile = (
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

  const profile = asRecord(root.profile) ?? root;

  return {
    email: readString(profile?.email, root.email, fallbackEmail),
    organizationName: readString(
      profile?.organization_name,
      profile?.agency_name,
    ),
    phone: readString(profile?.phone),
    address: readString(profile?.address),
  };
};

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const fallbackEmail = session?.user?.email;

  const [draftValues, setDraftValues] = useState<Partial<ProfileViewModel>>({});

  const profileQuery = useQuery({
    queryKey: ["settings", "profile", "agent"],
    queryFn: async () => {
      const response = await agentProfileService.getCurrentAgentProfile();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch account profile.");
      }
      return mapCurrentAgentProfile(response.data, fallbackEmail);
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

  const agentProfileMutation = useUpdateCurrentAgentProfileMutation();

  const buildAgentProfilePayload = () => {
    const organizationName = normalizeValue(formValues.organizationName);
    const phone = normalizeValue(formValues.phone);
    const address = normalizeValue(formValues.address);
    const profileOrganizationName = normalizeValue(
      profileData.organizationName,
    );
    const profilePhone = normalizeValue(profileData.phone);
    const profileAddress = normalizeValue(profileData.address);

    const profilePayload: {
      organization_name?: string;
      phone?: string;
      address?: string;
    } = {};

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

    return profilePayload;
  };

  const hasChanges =
    Boolean(profileQuery.data) &&
    (hasNormalizedValueChanged(
      formValues.organizationName,
      profileData.organizationName,
    ) ||
      hasNormalizedValueChanged(formValues.phone, profileData.phone) ||
      hasNormalizedValueChanged(formValues.address, profileData.address));

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

    try {
      const response =
        await agentProfileMutation.mutateAsync(buildAgentProfilePayload());

      toast.success(response.message || "Profile updated successfully.");
      setDraftValues({});
      queryClient.invalidateQueries({
        queryKey: ["settings", "profile", "agent"],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update account.";
      toast.error(message);
    }
  };

  const isLoading = profileQuery.isLoading;
  const isSaving = agentProfileMutation.isPending;

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

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h3 className="text-xl font-medium tracking-tight">Account Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage the profile details shown in your agent account.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-background/95 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
