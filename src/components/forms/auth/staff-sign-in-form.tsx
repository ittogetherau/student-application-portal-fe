"use client";

import PortalCredentialsForm from "./portal-credentials-form";

const StaffSignInForm = () => {
  return (
    <PortalCredentialsForm
      idPrefix="staff"
      submitLabel="Sign In as Staff"
      placeholderEmail="staff@example.com"
      role="staff"
    />
  );
};

export default StaffSignInForm;
