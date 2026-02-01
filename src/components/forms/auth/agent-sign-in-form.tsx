import PortalCredentialsForm from "./portal-credentials-form";

const AgentSignInForm = () => {
  return (
    <PortalCredentialsForm
      idPrefix="agent"
      submitLabel="Sign In"
      placeholderEmail="Enter your email."
      role="agent"
    />
  );
};

export default AgentSignInForm;
