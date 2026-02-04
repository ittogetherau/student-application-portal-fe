import { Suspense } from "react";
import NewForm from "../../../../features/application-form/components/new-form";

const page = async () => {
  return (
    <Suspense fallback={<div />}>
      <div className="p-4">
        <NewForm />
      </div>
    </Suspense>
  );
};

export default page;
