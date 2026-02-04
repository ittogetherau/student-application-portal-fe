"use client";

import PortalCredentialsForm from "./portal-credentials-form";

const StaffSignInForm = () => {
  return (
    <PortalCredentialsForm
      idPrefix="staff"
      submitLabel="Sign In"
      placeholderEmail="Enter your email."
      role="staff"
    />
  );
};

export default StaffSignInForm;
