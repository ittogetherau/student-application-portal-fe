import NewForm from "@/features/application-form/components/new-form";
import { Suspense } from "react";

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
