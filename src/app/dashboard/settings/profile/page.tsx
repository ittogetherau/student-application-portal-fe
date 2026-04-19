"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import authService from "@/service/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

type ProfileViewModel = {
  email: string;
  givenName: string;
  familyName: string;
  phone: string;
  role: string;
  status: string;
  avatarUrl: string;
};

const emptyProfile: ProfileViewModel = {
  email: "",
  givenName: "",
  familyName: "",
  phone: "",
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
    asRecord(user.profile) ?? asRecord(user.staff_profile) ?? asRecord(root.profile);

  return {
    email: readString(user.email, root.email, fallbackEmail),
    givenName: readString(
      user.given_name,
      user.first_name,
      profile?.given_name,
      profile?.first_name,
    ),
    familyName: readString(
      user.family_name,
      user.last_name,
      profile?.family_name,
      profile?.last_name,
    ),
    phone: readString(user.phone, profile?.phone),
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

  const updateMutation = useMutation({
    mutationKey: ["settings", "profile", "update"],
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await authService.updateCurrentUser(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to update account.");
      }
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Profile updated successfully.");
      setDraftValues({});
      queryClient.invalidateQueries({ queryKey: ["settings", "profile", "me"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update account.");
    },
  });

  const hasChanges =
    Boolean(profileQuery.data) &&
    (formValues.givenName !== profileData.givenName ||
      formValues.familyName !== profileData.familyName ||
      formValues.phone !== profileData.phone);

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

    await updateMutation.mutateAsync({
      given_name: formValues.givenName.trim(),
      family_name: formValues.familyName.trim(),
      phone: formValues.phone.trim() || null,
    });
  };

  const isLoading = profileQuery.isLoading;
  const isSaving = updateMutation.isPending;

  if (profileQuery.isError) {
    const error = profileQuery.error as Error;
    return (
      <Card className="backdrop-blur-xl bg-background/95 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{error.message || "Failed to load profile."}</CardDescription>
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
            Your details are fetched from `auth/me` and saved via API.
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
                  onChange={(event) => handleChange("phone", event.target.value)}
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
