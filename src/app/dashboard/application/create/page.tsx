import { Suspense } from "react";
import NewForm from "./_components/new-form";

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
