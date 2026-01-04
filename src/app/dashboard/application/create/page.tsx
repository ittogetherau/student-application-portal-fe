import { Suspense } from "react";
import NewForm from "./_components/new-form";

const page = async () => {
  return (
    <main>
      <Suspense fallback={<div />}>
        <NewForm />
      </Suspense>
    </main>
  );
};

export default page;
