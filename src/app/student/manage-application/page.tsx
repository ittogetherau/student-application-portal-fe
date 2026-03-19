import NewForm from "@/features/application-form/components/new-form";
import { siteRoutes } from "@/shared/constants/site-routes";
import { Suspense } from "react";

const StudentManageApplicationPage = () => {
  return (
    <Suspense fallback={<div />}>
      <div className="p-4">
        <NewForm
          backHref={siteRoutes.student.login}
          title="Create Application"
          description="Complete the form below to create your application."
          publicMode={true}
        />
      </div>
    </Suspense>
  );
};

export default StudentManageApplicationPage;
