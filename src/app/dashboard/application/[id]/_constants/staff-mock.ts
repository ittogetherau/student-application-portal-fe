export interface StaffMember {
  id: string;
  email: string;
  role: "admin" | "staff" | string;
  status: "active" | "inactive" | string;
  rto_profile_id: string;
  staff_profile: StaffProfile | null;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  department: string;
  job_title: string | null;
  permissions: StaffPermissions | null;
}

export interface StaffPermissions {
  staff_admin?: boolean;
  can_assess_gs?: boolean;
  can_manage_users?: boolean;
  can_approve_offers?: boolean;
  can_verify_documents?: boolean;
  can_approve_applications?: boolean;
  [key: string]: boolean | undefined;
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    email: "admin@churchill.edu.au",
    role: "admin",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: null,
    created_at: "2026-01-04T06:56:28.980924",
    updated_at: "2026-01-04T06:58:40.071247",
  },
  {
    id: "51122ece-70c6-47c4-a680-18b0e25d5c2e",
    email: "om@staff.com",
    role: "staff",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: {
      id: "d6508762-9704-4fb5-998e-f38689c549ef",
      department: "General",
      job_title: null,
      permissions: null,
    },
    created_at: "2026-01-04T06:58:51.164271",
    updated_at: "2026-01-04T06:58:51.164277",
  },
  {
    id: "2d5db39c-1a3b-4954-a12b-9d4aa1c84623",
    email: "om@admin.com",
    role: "staff",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: {
      id: "f3305d42-475e-4f22-9819-1bcf6c761d87",
      department: "General",
      job_title: null,
      permissions: { staff_admin: true },
    },
    created_at: "2026-01-04T06:59:05.490463",
    updated_at: "2026-01-04T06:59:05.490469",
  },
  {
    id: "d47c396b-3ab0-4210-852e-e140a383db96",
    email: "staff@cihe.com",
    role: "staff",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: {
      id: "3f7e7a60-24d5-4eae-832e-68a395cfd759",
      department: "General",
      job_title: null,
      permissions: null,
    },
    created_at: "2026-01-04T07:00:44.343381",
    updated_at: "2026-01-04T07:00:44.343389",
  },
  {
    id: "ff860680-96c0-4a91-a0ca-8a6dc15faa9c",
    email: "admin@cihe.com",
    role: "staff",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: {
      id: "e453fba9-da9a-4bc0-b5df-992e41c072dd",
      department: "General",
      job_title: null,
      permissions: { staff_admin: true },
    },
    created_at: "2026-01-04T07:00:55.276760",
    updated_at: "2026-01-04T07:03:19.816338",
  },
  {
    id: "9437833b-5ea7-4de4-af9e-71b47cdaefd0",
    email: "om.raut@churchill.edu.au",
    role: "staff",
    status: "active",
    rto_profile_id: "00000000-0000-0000-0000-000000000001",
    staff_profile: null,
    created_at: "2026-01-04T06:41:12.578696",
    updated_at: "2026-01-04T06:41:12.578729",
  },
];
